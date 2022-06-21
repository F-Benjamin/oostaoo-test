import React from "react";
import { UserMoves } from "../../App";
import "./moves.scss";

const Moves = () => {
  const value = React.useContext(UserMoves);
  return <p className="title">Moves : {value}</p>;
};
export default Moves;
