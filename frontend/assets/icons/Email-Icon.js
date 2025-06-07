import Svg, { Path } from "react-native-svg"
import { View, Text } from 'react-native'
import React from 'react'

const EmailIcon = (props) => {
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
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m2 6 6.913 3.917c2.549 1.444 3.625 1.444 6.174 0L22 6"
    />
    <Path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.016 13.476c.065 3.065.098 4.598 1.229 5.733 1.131 1.136 2.705 1.175 5.854 1.254 1.94.05 3.862.05 5.802 0 3.149-.079 4.723-.118 5.854-1.254 1.131-1.135 1.164-2.668 1.23-5.733.02-.986.02-1.966 0-2.952-.066-3.065-.099-4.598-1.23-5.733-1.131-1.136-2.705-1.175-5.854-1.254a115.11 115.11 0 0 0-5.802 0c-3.149.079-4.723.118-5.854 1.254-1.131 1.135-1.164 2.668-1.23 5.733a69.066 69.066 0 0 0 0 2.952Z"
    />
  </Svg>
  )
}

export default EmailIcon