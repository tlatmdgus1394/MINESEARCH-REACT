import React, { useReducer, createContext, useMemo, useEffect } from "react";
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
  data: { row: 0, cell: 0, mine: 0 },
  timer: 0,
  result: "",
  stopGame: true,
  openedCount: 0,
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
        data: { row: action.row, cell: action.cell, mine: action.mine },
        tableData: plantMine(action.row, action.cell, action.mine),
        stopGame: false,
        openedCount: 0,
        timer: 0,
      };
    case OPEN_CELL: {
      const tableData = [...state.tableData];
      tableData.forEach((row, i) => {
        tableData[i] = [...state.tableData[i]];
      });
      const checked = [];
      let openedCount = 0;
      const checkAround = (row, cell) => {
        if (
          ////닫혀있는 상태인 칸만 열기
          [
            CODE.OPENED,
            CODE.FLAG,
            CODE.FLAG_MINE,
            CODE.QUESTION,
            CODE.QUESTION_MINE,
          ].includes(tableData[row][cell])
        ) {
          return;
        }
        if (
          //상하좌우 없는 칸 안열기
          row < 0 ||
          row >= tableData.length ||
          cell < 0 ||
          cell >= tableData[0].length
        ) {
          return;
        }
        if (checked.includes(row + "," + cell)) {
          return;
        } else {
          checked.push(row + "," + cell);
        }
        openedCount += 1;
        let around = [];
        if (tableData[row - 1]) {
          around = around.concat(
            tableData[row - 1][cell - 1],
            tableData[row - 1][cell],
            tableData[row - 1][cell + 1]
          );
        }
        around = around.concat(
          tableData[row][cell - 1],
          tableData[row][cell + 1]
        );
        if (tableData[row + 1]) {
          around = around.concat(
            tableData[row + 1][cell - 1],
            tableData[row + 1][cell],
            tableData[row + 1][cell + 1]
          );
        }
        const count = around.filter((v) =>
          [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v)
        ).length;
        if (count === 0) {
          if (row > -1) {
            const near = [];
            if (row - 1 > -1) {
              near.push([row - 1, cell - 1]);
              near.push([row - 1, cell]);
              near.push([row - 1, cell + 1]);
            }
            near.push([row, cell - 1]);
            near.push([row, cell + 1]);
            if (row + 1 < tableData.length) {
              near.push([row + 1, cell - 1]);
              near.push([row + 1, cell]);
              near.push([row + 1, cell + 1]);
            }
            near.forEach((v) => {
              if (tableData[v[0]][v[1]] < CODE.OPENED) {
                checkAround(v[0], v[1]);
              }
            });
          }
        }
        tableData[row][cell] = count;
      };
      checkAround(action.row, action.cell);
      let stopGame = false;
      let result = "";
      console.log(
        state.data.row * state.data.cell - state.data.mine,
        state.openedCount + openedCount,
        stopGame
      );
      if (
        state.data.row * state.data.cell - state.data.mine ===
        state.openedCount + openedCount
      ) {
        stopGame = true;
        result = `클리어! 기록 : ${state.timer}초`;
      }
      return {
        ...state,
        tableData,
        openedCount: state.openedCount + openedCount,
        stopGame,
        result,
      };
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
    case SET_TIMER:
      return { ...state, timer: state.timer + 1 };
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
export const SET_TIMER = "SET_TIMER";

const MineSearch = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { stopGame, tableData, timer, result } = state;
  const value = useMemo(
    () => ({ tableData, stopGame, dispatch }),
    [tableData, stopGame]
  );

  useEffect(() => {
    let timer;
    if (stopGame === false) {
      timer = setInterval(() => {
        dispatch({ type: SET_TIMER });
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [stopGame]);
  return (
    <>
      <TableContext.Provider value={value}>
        <Form />
        <div>{timer}초 경과</div>
        <Table />
        <div>{result}</div>
      </TableContext.Provider>
    </>
  );
};

export default MineSearch;
