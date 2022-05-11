// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

library XYCoordinates {
    function coordinates(uint256 numRows, uint256 numColumns)
        public
        pure
        returns (string[] memory)
    {
        string[] memory allCoords = new string[](numRows * numColumns);
        string[51] memory nums = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
            "24",
            "25",
            "26",
            "27",
            "28",
            "29",
            "30",
            "31",
            "32",
            "33",
            "34",
            "35",
            "36",
            "37",
            "38",
            "39",
            "40",
            "41",
            "42",
            "43",
            "44",
            "45",
            "46",
            "47",
            "48",
            "49",
            "50"
        ];
        uint256 curIndex = 0;
        for (uint256 i = 0; i < numColumns; i++) {
            for (uint256 j = 0; j < numRows; j++) {
                allCoords[curIndex] = string(
                    abi.encodePacked(nums[i], ",", nums[j])
                );
                curIndex++;
            }
        }
        return allCoords;
    }
}
