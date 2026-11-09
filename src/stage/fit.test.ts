import assert from "node:assert/strict"
import { test } from "node:test"
import { fittedSize } from "./fit.ts"

test("a title that fits keeps its size", () => {
  assert.equal(fittedSize(40, 300, 350, 20), 40)
  assert.equal(fittedSize(40, 350.4, 350, 20), 40)
})

test("one that doesn't shrinks by how far it overruns", () => {
  assert.equal(fittedSize(40, 400, 300, 20), 30)
  assert.equal(fittedSize(52, 455, 350, 20), 40)
})

test("but never below the floor, and never on an empty or hidden box", () => {
  assert.equal(fittedSize(40, 4000, 300, 20), 20)
  assert.equal(fittedSize(40, 0, 300, 20), 40)
  assert.equal(fittedSize(40, 400, 0, 20), 40)
})
