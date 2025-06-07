import { View, Text } from 'react-native'
import React from 'react'
import Svg, { Path } from "react-native-svg"

const ArrowLeft = (props) => {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg" 
            width={24}
            height={24}
            fill="none"
            color={props.color}
            {...props}
        >
            <Path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={props.strokeWidth}
                d="M15 6s-6 4.419-6 6c0 1.581 6 6 6 6"
            />
        </Svg>
    )
}

export default ArrowLeft