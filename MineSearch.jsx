import React, { useReducer, createContext, useMemo } from "react";
import Table from "./Table";
import Form from "./Form";

export const CODE = {
  MINE: -7,
  NORMAL: -1,
  QUESTION: -2,
  FLAG: -3,
  QUESTION_MINE: -4,
  FLAG_MINE: -5,
  CLICKED_MINE: -6,
  OPENED: 0,
};

export const TableContext = createContext({
  tableData: [],
  stopGame: true,
  dispatch: () => {},
});

const initialState = {
  tableData: [],
  timer: 0,
  result: "",
  stopGame: true,
};

const plantMine = (row, cell, mine) => {
  console.log(row, cell, mine);
  const candidate = Array(row * cell)
    .fill()
    .map((arr, i) => {
      return i;
    });
  const shuffle = [];
  while (candidate.length > row * cell - mine) {
    const chosen = candidate.splice(
      Math.floor(Math.random() * candidate.length),
      1
    )[0];
    shuffle.push(chosen);
  }
  const data = [];
  for (let i = 0; i < row; i++) {
    const rowData = [];
    data.push(rowData);
    for (let j = 0; j < cell; j++) {
      rowData.push(CODE.NORMAL);
    }
  }
  //shuffle = [12, 85, 72]; row = 10; cell = 10;
  for (let k = 0; k < shuffle.length; k++) {
    const ver = Math.floor(shuffle[k] / cell);
    //지뢰가 심겨져있는 줄
    const hor = shuffle[k] % cell;
    //지뢰가 심어진 칸
    data[ver][hor] = CODE.MINE;
    //칸의 데이터를 지뢰로 변경
  }
  console.log(data);
  return data;
};

const reducer = (state, action) => {
  switch (action.type) {
    case START_GAME:
      return {
        ...state,
        tableData: plantMine(action.row, action.cell, action.mine),
        stopGame: false,
      };
    case OPEN_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      tableData[action.row][action.cell] = CODE.OPENED;
      return { ...state, tableData };
    }
    case CLICK_MINE: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      tableData[action.row][action.cell] = CODE.CLICKED_MINE;
      return { ...state, tableData, stopGame: true };
    }
    case FLAG_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.MINE) {
        tableData[action.row][action.cell] = CODE.FLAG_MINE;
      } else if (tableData[action.row][action.cell] === CODE.NORMAL) {
        tableData[action.row][action.cell] = CODE.FLAG;
      }
      return { ...state, tableData };
    }
    case QUESTION_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.FLAG_MINE) {
        tableData[action.row][action.cell] = CODE.QUESTION_MINE;
      } else if (tableData[action.row][action.cell] === CODE.FLAG) {
        tableData[action.row][action.cell] = CODE.QUESTION;
      }
      return { ...state, tableData };
    }
    case NORMALIZE_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.QUESTION_MINE) {
        tableData[action.row][action.cell] = CODE.MINE;
      } else if (tableData[action.row][action.cell] === CODE.QUESTION) {
        tableData[action.row][action.cell] = CODE.NORMAL;
      }
      return { ...state, tableData };
    }
    default:
      return state;
  }
};

export const START_GAME = "START_GAME";
export const OPEN_CELL = "OPEN_CELL";
export const CLICK_MINE = "CLICK_MINE";
export const QUESTION_CELL = "QUESTION_CELL";
export const FLAG_CELL = "FLAG_CELL";
export const NORMALIZE_CELL = "NORMALIZE_CELL";

const MineSearch = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { stopGame, tableData, timer, result } = state;
  const value = useMemo(
    () => ({ tableData, stopGame, dispatch }),
    [tableData, stopGame]
  );
  return (
    <>
      <TableContext.Provider value={value}>
        <Form />
        <div>{timer}</div>
        <Table />
        <div>{result}</div>
      </TableContext.Provider>
    </>
  );
};

export default MineSearch;
