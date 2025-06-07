import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const hp = (percentage) => {
    const value = (percentage / 100) * height;
    return Math.round(value);
};

const wp = (percentage) => {
    const value = (percentage / 100) * width;
    return Math.round(value);
};

export { hp, wp };

