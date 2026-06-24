from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
EXPORTS = ROOT / "exports" / "brand"
APP = ROOT / "app"

DX = 43


def render_rich(size, bg=None):
    scale = size / 512

    def sc(value):
        return int(round(value * scale))

    def point(x, y):
        return (sc(x + DX), sc(y))

    def box(x1, y1, x2, y2):
        return (sc(x1 + DX), sc(y1), sc(x2 + DX), sc(y2))

    def vertical_gradient(image_size, stops):
        width, height = image_size
        strip = Image.new("RGBA", (1, height))
        pixels = strip.load()
        stops = sorted(stops)

        for y in range(height):
            position = y / max(1, height - 1)
            for index in range(len(stops) - 1):
                if stops[index][0] <= position <= stops[index + 1][0]:
                    start_pos, start_color = stops[index]
                    end_pos, end_color = stops[index + 1]
                    mix = (position - start_pos) / max(1e-6, end_pos - start_pos)
                    pixels[0, y] = tuple(
                        int(start_color[channel] + (end_color[channel] - start_color[channel]) * mix)
                        for channel in range(4)
                    )
                    break
            else:
                pixels[0, y] = stops[-1][1]

        return strip.resize(image_size)

    def circle_layer(cx, cy, radius, fill, blur=0):
        layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=fill)
        return layer.filter(ImageFilter.GaussianBlur(blur)) if blur else layer

    image = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))

    n_points = [
        point(58, 421),
        point(58, 111),
        point(126, 111),
        point(287, 352),
        point(287, 421),
        point(226, 421),
        point(126, 270),
        point(126, 421),
    ]

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.polygon([(x + sc(2), y + sc(5)) for x, y in n_points], fill=(0, 9, 28, 120))
    shadow_draw.rounded_rectangle(box(313, 180, 370, 426), radius=sc(10), fill=(0, 9, 28, 120))
    image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(sc(3))))

    dot_x, dot_y = point(342, 115)
    image.alpha_composite(circle_layer(dot_x, dot_y, sc(106), (37, 99, 235, 46), sc(20)))
    image.alpha_composite(circle_layer(dot_x, dot_y, sc(58), (186, 239, 254, 60), sc(14)))

    n_mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(n_mask).polygon(n_points, fill=255)
    n_gradient = vertical_gradient(
        (size, size),
        [
            (0, (255, 255, 255, 255)),
            (0.42, (238, 242, 251, 255)),
            (0.72, (248, 250, 255, 255)),
            (1, (217, 224, 239, 255)),
        ],
    )
    n_gradient.putalpha(n_mask)
    image.alpha_composite(n_gradient)

    grain = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    grain_pixels = grain.load()
    random.seed(8)
    for _ in range(max(12000, int(size * size * 0.012))):
        x = random.randrange(sc(58 + DX), sc(288 + DX))
        y = random.randrange(sc(111), sc(422))
        if n_mask.getpixel((x, y)):
            if random.random() > 0.5:
                grain_pixels[x, y] = (255, 255, 255, random.randrange(4, 16))
            else:
                grain_pixels[x, y] = (145, 160, 190, random.randrange(4, 13))
    image.alpha_composite(grain.filter(ImageFilter.GaussianBlur(0.5)))

    bevel = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bevel_draw = ImageDraw.Draw(bevel)
    bevel_draw.line([point(75, 123), point(75, 407)], fill=(255, 255, 255, 70), width=sc(5))
    bevel_draw.line([point(123, 119), point(280, 354)], fill=(255, 255, 255, 38), width=sc(4))
    bevel.putalpha(Image.composite(bevel.getchannel("A"), Image.new("L", (size, size), 0), n_mask))
    image.alpha_composite(bevel)

    stem_mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(stem_mask).rounded_rectangle(box(311, 175, 368, 421), radius=sc(10), fill=255)
    stem = vertical_gradient(
        (size, size),
        [
            (0, (60, 140, 255, 255)),
            (0.48, (37, 99, 235, 255)),
            (1, (29, 86, 217, 255)),
        ],
    )
    stem.putalpha(stem_mask)
    image.alpha_composite(stem)

    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(highlight).rounded_rectangle(
        box(321, 185, 333, 409),
        radius=sc(6),
        fill=(101, 160, 255, 58),
    )
    image.alpha_composite(highlight)

    image.alpha_composite(circle_layer(dot_x, dot_y, sc(42), (186, 239, 254, 55), sc(5)))
    image.alpha_composite(circle_layer(dot_x, dot_y, sc(31), (186, 239, 254, 255)))
    highlight_x, highlight_y = point(332, 104)
    image.alpha_composite(circle_layer(highlight_x, highlight_y, sc(10), (255, 255, 255, 100)))

    return image


def main():
    EXPORTS.mkdir(parents=True, exist_ok=True)

    transparent_2048 = render_rich(2048)
    preview_2048 = render_rich(2048, (5, 14, 34, 255))
    transparent_1024 = transparent_2048.resize((1024, 1024), Image.Resampling.LANCZOS)
    preview_1024 = preview_2048.resize((1024, 1024), Image.Resampling.LANCZOS)

    transparent_2048.save(EXPORTS / "b01-ni-rich-2048.png", optimize=True)
    preview_2048.save(EXPORTS / "b01-ni-rich-dark-preview-2048.png", optimize=True)
    transparent_1024.save(EXPORTS / "b01-ni-rich-1024.png", optimize=True)
    preview_1024.save(EXPORTS / "b01-ni-rich-dark-preview-1024.png", optimize=True)

    preview_1024.save(APP / "icon.png", optimize=True)
    preview_2048.resize((180, 180), Image.Resampling.LANCZOS).save(APP / "apple-icon.png", optimize=True)
    preview_2048.resize((256, 256), Image.Resampling.LANCZOS).save(
        APP / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )

    for path in [
        EXPORTS / "b01-ni-rich-2048.png",
        EXPORTS / "b01-ni-rich-dark-preview-2048.png",
        APP / "favicon.ico",
        APP / "icon.png",
        APP / "apple-icon.png",
    ]:
        with Image.open(path) as image:
            print(f"{path}: {image.size} {image.mode} {path.stat().st_size}")
            if path.suffix == ".ico":
                print(f"ico sizes: {sorted(image.ico.sizes())}")


if __name__ == "__main__":
    main()
