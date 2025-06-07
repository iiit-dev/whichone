import { View, Text, Image } from 'react-native'
import React from 'react'
import { hp, wp } from '@/constants/font-size'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'
// borderColor: 'black',
// borderWidth: 1
const Welcome = () => {
  const router = useRouter()
  return (
    <View
      className='flex flex-col justify-between items-center gap-3 bg-dark-bg '
      style={{ height: hp(100) }}
    >
      <Image
        source={require('@/assets/images/sign-in-page-illustration-undraw.png')}
        style={{
          height: hp(50),
          width: wp(86.5),
          alignSelf: 'center',
          // borderColor: 'black',
          // borderWidth: 1
        }}
        // className='border'
        resizeMode="contain"
      />
      <View className="w-full gap-2 flex flex-col justify-center items-center">
        <View className="items-center flex flex-col justify-center "
        style={
          {
            // marginBottom
          }
        }
        >
          <Text>
            <Text style={{ fontSize: hp(4.5), lineHeight: hp() }} className="whitespace-nowrap text-center text-dark-text font-semibold">Upload, Poll,</Text>
            {"\n"}
            <Text style={{ fontSize: hp(4.5), lineHeight: hp() }} className="whitespace-nowrap text-center text-dark-text font-semibold">Get Feedback Instantly!</Text>
          </Text>
        </View>
        <View className=" items-center flex flex-col justify-center">
          <Text>
            <Text style={{ fontSize: hp(2.25) }} className="whitespace-nowrap text-center text-dark-text-secondary">Get instant feedback, filter audience,</Text>
            {"\n"}
            <Text style={{ fontSize: hp(2.25) }} className="whitespace-nowrap text-center text-dark-text-secondary">set limits, and decide fast!</Text>
          </Text>
        </View>

      </View>

      <View className="mb-10 w-full flex flex-row items-center justify-center gap-4">
        <Button
          title='Login'
          onPress={() => router.push('/login')}
          loading={false}
          className={null}
          textClassName="text-dark-text text-center font-semibold"
          icon={null}
          fontSize={hp(2.7)}
          customClass="w-[30%] bg-dark-accent px-4 py-3 rounded-lg flex justify-center items-center"
          style={{}}
        />
        <Button
          title='Register'
          onPress={() => router.push('/register')}
          loading={false}
          className={null}
          textClassName="text-dark-accent font-semibold text-center [text-shadow:_0px_0px_0px_#838383]"
          icon={null}
          fontSize={hp(2.7)}
          customClass='w-[30%] bg-dark-secondary border border-dark-border'
          style={{}}
        />
      </View>
    </View>
  )
}

export default Welcome