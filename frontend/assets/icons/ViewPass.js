import { View, Text } from 'react-native'
import React from 'react'
import Svg, { Path } from "react-native-svg"

const ViewPass = (props) => {
  return (
    <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    color="#000"
    {...props}
  >
    <Path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M21.544 11.045c.304.426.456.64.456.955 0 .316-.152.529-.456.955C20.178 14.871 16.689 19 12 19c-4.69 0-8.178-4.13-9.544-6.045C2.152 12.529 2 12.315 2 12c0-.316.152-.529.456-.955C3.822 9.129 7.311 5 12 5c4.69 0 8.178 4.13 9.544 6.045Z"
    />
    <Path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z"
    />
  </Svg>
  )
}

export default ViewPass