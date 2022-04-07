import React, { useContext } from "react";
import Td from "./Td";
import { TableContext } from "./MineSearch";

const Tr = ({ rowIndex }) => {
  const { tableData } = useContext(TableContext);
  return (
    <tr>
      {tableData[0] && //tableData[0]이 undefined일 경우를 대비한 코드
        Array(tableData[0].length)
          .fill()
          .map((td, i) => <Td key={i} rowIndex={rowIndex} cellIndex={i} />)}
    </tr>
  );
};

export default Tr;
