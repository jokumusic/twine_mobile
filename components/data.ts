

export let SearchString: string ="";

export const setSearchString = (s:string) =>{
  SearchString = s;
}

export const getFavorites = ()=>{
  if(!SearchString)
    return favorites;

  const regex = new RegExp(SearchString, 'i');
  let filteredData = [];
  favorites.forEach((d)=>{
    if(regex.test(d.title) || regex.test(d.body))
      filteredData.push(d);
  });

  return filteredData;
}

export const getStores = ()=>{
  if(!SearchString)
    return stores;

  const regex = new RegExp(SearchString, 'i');
  let filteredData = [];
  stores.forEach((d)=>{
    if(regex.test(d.title) || regex.test(d.body))
      filteredData.push(d);
  });

  return filteredData;
}

export const favorites = [
    {
      id: -1,
      imgUrl: 'https://cryptosrus.com/wp-content/uploads/2021/12/Anatoly-Yakovenko-of-Solana-Reveals-Why-Were-Not-in-a-Crypto-Bubble.jpg',
      title: 'Anatoly Yakovenko Official',  
      body: 'Hi! Come watch me eat glass!',
      twitter: 'https://twitter.com/aeyakovenko',
      instagram: 'https://www.instagram.com/anatolyyakovenko.sola/',
    },
    {
      id: 0,
      imgUrl: 'https://theworldunplugged.files.wordpress.com/2010/11/screen-shot-2010-12-07-at-1-35-48-pm.png',
      title: 'Busy Media Inc.',  
      body: 'Busy Media Inc. is the leading distributor of music, videos, books and art!',
      twitter:'https://',
      instagram:'https://',
      web:'https://',  
    },
    {
      id: 1,
      imgUrl: 'https://media.gettyimages.com/vectors/clothes-and-accessories-related-vector-banner-design-concept-modern-vector-id1341159950?k=20&m=1341159950&s=612x612&w=0&h=JQiJzyVQEH8vtbGM4LCVbW2bC6yqJRu3vDM6Bws6qp8=',
      title: 'Trendy Clothing Co.',
      body: 'All the trendy modern, old, contemporary clothes are here!',
      twitter: 'https://',
      web:'https://',  
    },
    {
      id: 2,
      imgUrl: 'https://www.dualipa.com/wp-content/uploads/2019/10/DONT_START_NOW.jpg',
      title: 'Dua Lipa Official',
      body: 'This is the official Dua Lipa store!',
      twitter: 'https://twitter.com/DUALIPA',
      instagram: 'https://www.instagram.com/dualipa',
      facebook: 'https://www.facebook.com/DuaLipa'
    },   
    {
      id: 5,
      imgUrl: 'https://images-na.ssl-images-amazon.com/images/G/01/gc/designs/livepreview/amazon_dkblue_noto_email_v2016_us-main._CB468775337_.png',
      title: 'Amazon',
      body: 'Official Amazon Store',
      twitter: 'https://twitter.com/amazon',
      web: 'https://amazon.com'
    },
  ];

export const stores = [
  {
    id: 2,
    imgUrl: 'https://m.media-amazon.com/images/M/MV5BNDVkYjU0MzctMWRmZi00NTkxLTgwZWEtOWVhYjZlYjllYmU4XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg',
    title: 'Friends Official',
    body: 'Your F.R.I.E.N.D.S store',
  },
  {
    id: 3,
    imgUrl: 'https://images.indianexpress.com/2017/06/tom-cruise-759.jpg?w=389',
    title: 'Tom Cruise Official',
    body: 'This is Tom Cruise Missle\'s store',
    twitter: 'https://twitter.com/tomcruise',
    instagram: 'https://www.instagram.com/tomcruise',
    facebook: 'https://www.facebook.com/officialtomcruise',
  },
  {
    id: 4,
    imgUrl: 'https://cdn.mos.cms.futurecdn.net/5StAbRHLA4ZdyzQZVivm2c-1200-80.jpg.webp',
    title: 'Walmart',
    body: 'Save money. Live better.',
    twitter: 'https://twitter.com/Walmart', 
    web: 'https://walmart.com'
  },
];
  