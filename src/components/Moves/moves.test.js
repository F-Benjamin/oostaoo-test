import Moves from "./moves";
import { render } from "@testing-library/react";
import React from "react";
import { UserMoves } from "../../App";

test("Should render without crash", async () => {
  render(<Moves />);
});
test("Value at start", () => {
  const values = UserMoves;
  expect(values.theadCount).toBeUndefined;
});
