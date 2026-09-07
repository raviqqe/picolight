export const source = `
from sys import exit

# This is a line comment.

"""
This is a block comment.
"""

xs = [False, True, None]


def fibonacci(x: int) -> int:
    if x < 2:
        return x
    else:
        return fibonacci(x - 1) + fibonacci(x - 2)


print("Hello, world!")

print("\\n\\r\\t\\"\\\\")
`.trim();
