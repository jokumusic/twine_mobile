import React, { useEffect, useState } from 'react'
import { View } from "react-native"
import Carousel, { Pagination } from 'react-native-snap-carousel'
import CarouselCardItem, { SLIDER_WIDTH, ITEM_WIDTH } from './CarouselCardItem'
import { getFavorites, SearchString } from '../components/data';

const CarouselCards = () => {
  const isCarousel = React.useRef(null)
  const [index, setIndex] = React.useState(0)
  const [favorites, updateFavorites] = useState([]);
  useEffect(()=>{
    getFavorites()
    .then(items=> updateFavorites(items))
    .catch(e=>log(e));
  }, [SearchString])

  return (
    <View>
      <Carousel
        layout="default"
        layoutCardOffset={9}
        ref={isCarousel}
        data={favorites}
        renderItem={CarouselCardItem}
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        inactiveSlideShift={0}
        useScrollView={true}
        onSnapToItem={(index) => setIndex(index)}
      />
      {/*
      <Pagination
  dotsLength={favorites.length}
  activeDotIndex={index}
  carouselRef={isCarousel}
  dotStyle={{
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)'
  }}
  inactiveDotOpacity={0.4}
  inactiveDotScale={0.6}
  tappableDots={true}
/>
*/}
    </View>
  )
}


export default CarouselCards