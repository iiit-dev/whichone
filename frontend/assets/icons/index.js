import { View, Text } from 'react-native'
import React from 'react'
import HomeIcon from './HomeIcon'
import SearchIcon from './SeachIcon'
import EmailIcon from './Email-Icon'
import ArrowLeft from './ArrowLeft'
import ViewPass from './ViewPass'
import ViewOff from './ViewOff'
const icons = {
    "home": HomeIcon,
    "search": SearchIcon,
    "arrow-left": ArrowLeft,
    "email": EmailIcon,
    "view-pass": ViewPass,
    "view-off": ViewOff
}

const Icon = ({ name, ...props }) => {
    const IconComponent = icons[name]
    return (
        <IconComponent
            color={props.color || "#fb9b3c"}
            strokeWidth={props.strokeWidth || 1.5}
            height={props.height || 24}
            width={props.width || 24}
            {...props} />
    )
}

export default Icon