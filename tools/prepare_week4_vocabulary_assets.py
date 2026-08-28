from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images" / "week-4" / "games" / "vocabulary"
GENERATED = Path(r"C:\Users\jdtje\.codex\generated_images\01a02fab-2147-7412-8e42-b89c86e7c999")

ASSETS = {
    "lorenzo-langstroth.png": GENERATED / "exec-269729e3-04ab-4b0a-84a7-dc5a0d845c26.png",
    "loved-bees.png": GENERATED / "exec-cfa10f8e-b26f-48a2-bcba-d72dc64c2595.png",
    "helped-beekeepers.png": GENERATED / "exec-4335f429-c67f-4483-bf3d-4f34a9a57acb.png",
    "wrote-a-book.png": GENERATED / "exec-517fa2ac-4384-4722-adf5-cef4dcec3b7a.png",
    "kept-bees.png": GENERATED / "exec-8451ccc4-b621-4279-8135-78a14a49a97f.png",
    "made-modern-beehive.png": GENERATED / "exec-c83fa5e5-4b06-422c-8e02-503b97ec0283.png",
}


def remove_connected_neutral_background(image: Image.Image) -> Image.Image:
    """Remove only the pale neutral field connected to an outer image edge."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_background(x: int, y: int) -> bool:
        red, green, blue = pixels[x, y]
        return min(red, green, blue) >= 188 and max(red, green, blue) - min(red, green, blue) <= 20

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if not visited[index] and is_background(x, y):
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    rgba = rgb.convert("RGBA")
    alpha = Image.new("L", (width, height), 255)
    alpha_pixels = alpha.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if visited[row + x]:
                alpha_pixels[x, y] = 0
    rgba.putalpha(alpha)
    return rgba


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, source in ASSETS.items():
        image = Image.open(source)
        if "A" not in image.mode or image.getchannel("A").getextrema()[0] == 255:
            image = remove_connected_neutral_background(image)
        else:
            image = image.convert("RGBA")
        target = OUT / filename
        image.save(target, optimize=True)
        alpha = image.getchannel("A")
        bounds = alpha.getbbox()
        print(f"{filename}: {image.mode} {image.size}, alpha={alpha.getextrema()}, content={bounds}")


if __name__ == "__main__":
    main()
