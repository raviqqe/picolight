export const source = `
#include <stdio.h>

// This is a line comment.

/*
This is a block comment.
*/

const int xs[] = {0, 1, 2};

int fibonacci(int x) {
  if (x < 2) {
    return x;
  } else {
    return fibonacci(x - 1) + fibonacci(x - 2);
  }
}

int main(void) {
  printf("Hello, world!\\n");

  printf("\\n\\r\\t\\"\\\\");

  return 0;
}
`.trim();
