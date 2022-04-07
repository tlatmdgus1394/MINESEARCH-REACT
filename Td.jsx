import React, { useContext, useCallback } from "react";
import {
  CODE,
  OPEN_CELL,
  CLICK_MINE,
  QUESTION_CELL,
  FLAG_CELL,
  NORMALIZE_CELL,
  TableContext,
} from "./MineSearch";

const getTdStyle = (code) => {
  switch (code) {
    case CODE.NORMAL:
    case CODE.MINE:
      return { background: "gray" };
    case CODE.OPENED:
      return { background: "white" };
    case CODE.FLAG:
    case CODE.FLAG_MINE:
      return { background: "orange" };
    case CODE.QUESTION:
    case CODE.QUESTION_MINE:
      return { background: "yellow" };
    case CODE.CLICKED_MINE:
      return { background: "red" };
    default:
      return { background: "white" };
  }
};

const getTdText = (code) => {
  switch (code) {
    case CODE.NORMAL:
      return "";
    case CODE.MINE:
      return "X";
    case CODE.QUESTION:
    case CODE.QUESTION_MINE:
      return "?";
    case CODE.CLICKED_MINE:
      return "펑";
    case CODE.FLAG:
    case CODE.FLAG_MINE:
      return "!";
    case CODE.OPENED:
      return "";
    default:
      return "";
  }
};

const Td = ({ rowIndex, cellIndex }) => {
  const { tableData, stopGame, dispatch } = useContext(TableContext);

  const onClickTd = useCallback(() => {
    if (stopGame) {
      return;
    }
    switch (tableData[rowIndex][cellIndex]) {
      case CODE.OPENED:
        return;
      case CODE.NORMAL:
        dispatch({ type: OPEN_CELL, row: rowIndex, cell: cellIndex });
        return;
      case CODE.MINE:
        dispatch({ type: CLICK_MINE, row: rowIndex, cell: cellIndex });
      default:
        return;
    }
  }, [tableData[rowIndex][cellIndex], stopGame]);

  const onRightCLickTd = useCallback(
    (e) => {
      e.preventDefault();
      if (stopGame) {
        return;
      }
      switch (tableData[rowIndex][cellIndex]) {
        case CODE.NORMAL:
        case CODE.MINE:
          dispatch({ type: FLAG_CELL, row: rowIndex, cell: cellIndex });
          return;
        case CODE.FLAG:
        case CODE.FLAG_MINE:
          dispatch({
            type: QUESTION_CELL,
            row: rowIndex,
            cell: cellIndex,
          });
          return;
        case CODE.QUESTION_MINE:
        case CODE.QUESTION:
          dispatch({
            type: NORMALIZE_CELL,
            row: rowIndex,
            cell: cellIndex,
          });
          return;
        default:
          return;
      }
    },
    [tableData[rowIndex][cellIndex], stopGame]
  );

  return (
    <td
      onClick={onClickTd}
      onContextMenu={onRightCLickTd}
      style={getTdStyle(tableData[rowIndex][cellIndex])}
    >
      {getTdText(tableData[rowIndex][cellIndex])}
    </td>
  );
};

export default Td;
