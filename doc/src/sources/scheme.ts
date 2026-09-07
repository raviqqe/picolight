export const source = `
(import (scheme base))

; This is a line comment.

#|
This is a block comment.
|#

(define xs '(#f #t ()))

(define ys '(import export import-export))

(define (fibonacci x)
  (if (< x 2)
    x
    (+
      (fibonacci (- x 1))
      (fibonacci (- x 2)))))

(write-string "Hello, World!")

(write-string "\\n\\r\\t\\"\\\\")
`.trim();
