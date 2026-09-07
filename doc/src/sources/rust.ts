export const source = `
use std::process::exit;

// This is a line comment.

/*
This is a block comment.
*/

const XS: [bool; 2] = [false, true];

fn fibonacci(x: u64) -> u64 {
    if x < 2 {
        x
    } else {
        fibonacci(x - 1) + fibonacci(x - 2)
    }
}

fn main() {
    println!("Hello, world!");

    println!("\\n\\r\\t\\"\\\\");
}
`.trim();
