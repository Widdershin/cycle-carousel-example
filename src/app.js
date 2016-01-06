import {Observable} from 'rx';
import {div, img, button} from 'cycle-snabbdom';

const catPictures = [
  'http://25.media.tumblr.com/Jjkybd3nScerz2jsjvrqDPix_400.jpg',
  'http://25.media.tumblr.com/tumblr_lny14qJ7Wu1qdth8zo1_1280.jpg',
  'http://25.media.tumblr.com/tumblr_mbo4u98wvQ1qhwmnpo1_1280.jpg',
  'http://30.media.tumblr.com/tumblr_m26a45YwZA1r6t7tvo1_500.gif',
  'http://25.media.tumblr.com/tumblr_m2x23lyfit1qzo3c9o1_1280.jpg',
  'http://24.media.tumblr.com/tumblr_lz6q15mm8o1qgjltdo1_1280.jpg',
  'http://25.media.tumblr.com/tumblr_lqybq53rCI1qjimsvo1_1280.png',
  'http://25.media.tumblr.com/tumblr_lz7me0Y6JU1qgjltdo1_1280.jpg',
  'http://24.media.tumblr.com/tumblr_lggvvf2mCm1qgnva2o1_500.gif'
];

function renderImage (url, index, key, change) {
  return (
    img('.cat', {
      key,
      props: {src: url, alt: url, height: '500', width: '400'},
      style: {
        opacity: '0',
        transform: `translateX(${(index + change) * 440}px)`,
        delayed: {opacity: '1', transform: `translateX(${index * 440}px)`},
        remove: {opacity: '0', transform: `translateX(${(index - change) * 440}px)`}
      }
    })
  );
}

function renderCarousel (catPictures, scrollOffset, change) {
  const imagesToShow = 3;
  return (
    div('.carousel-images', catPictures
      .slice(scrollOffset, scrollOffset + imagesToShow)
      .map((cat, index) => renderImage(cat, index, index + scrollOffset, change))
    )
  );
}

export default function Carousel ({DOM}) {
  const next$ = DOM
    .select('.next')
    .events('click')
    .map(_ => +1);

  const previous$ = DOM
    .select('.previous')
    .events('click')
    .map(_ => -1);

  const scrollChange$ = next$.merge(previous$)
    .startWith(0);

  const scroll$ = scrollChange$
    .scan((total, change) => total + change)
    .startWith(0);

  return {
    DOM: Observable.combineLatest(scroll$, scrollChange$, (scroll, change) =>
      div('.carousel', [
        button('.previous', {props: {disabled: scroll === 0}}, 'Previous'),
        button('.next', {props: {disabled: scroll === catPictures.length - 3}}, 'Next'),
        renderCarousel(catPictures, scroll, change)
      ])
    ),

    scroll$
  };
}

export default function App ({DOM}) {
  const carousel = Carousel({DOM});

  const textForEachCat = [
    'wow',
    'what a cat!',
    'did you see that one?',
    'best cat eveer',
    'fo realzies',
    'awwwwwwwwwwwwwwwwww',
    'awwwhhhhhhhhwwhwhwhwhhhhhhhhh',
    'kitty!',
    'I should check my neko atsume...'
  ];

  const text$ = carousel.scroll$.map(scroll => textForEachCat[scroll]);

  return {
    DOM: Observable.combineLatest(text$, carousel.DOM, (text, carouselDOM) =>
      div('.example', [
        carouselDOM,
        div('.text', text)
      ])
    )
  };
}
