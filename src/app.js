import {Observable} from 'rx';
import {div, img, button} from 'cycle-snabbdom';

const carouselItems = [
  {url: 'http://25.media.tumblr.com/Jjkybd3nScerz2jsjvrqDPix_400.jpg', text: 'wow'},
  {url: 'http://25.media.tumblr.com/tumblr_lny14qJ7Wu1qdth8zo1_1280.jpg', text: 'what a cat!'},
  {url: 'http://25.media.tumblr.com/tumblr_mbo4u98wvQ1qhwmnpo1_1280.jpg', text: 'did you see that one?'},
  {url: 'http://30.media.tumblr.com/tumblr_m26a45YwZA1r6t7tvo1_500.gif', text: 'best cat eveer'},
  {url: 'http://25.media.tumblr.com/tumblr_m2x23lyfit1qzo3c9o1_1280.jpg', text: 'fo realzies'},
  {url: 'http://24.media.tumblr.com/tumblr_lz6q15mm8o1qgjltdo1_1280.jpg', text: 'awwwwwwwwwwwwwwwwww'},
  {url: 'http://25.media.tumblr.com/tumblr_lqybq53rCI1qjimsvo1_1280.png', text: 'awwwhhhhhhhhwwhwhwhwhhhhhhhhh'},
  {url: 'http://25.media.tumblr.com/tumblr_lz7me0Y6JU1qgjltdo1_1280.jpg', text: 'kitty!'},
  {url: 'http://24.media.tumblr.com/tumblr_lggvvf2mCm1qgnva2o1_500.gif', text: 'I should check my neko atsume...'}
];

function renderImage (url, index, key, change) {
  return (
    img('.carouselItem', {
      key,
      props: {src: url, alt: url, height: '500', width: '400'},
      style: {
        opacity: '0',
        transition: 'opacity 2s',
        delayed: {opacity: '1', order: index},
        remove: {display: 'none', order: 100}
      }
    })
  );
}

function renderCarousel (carouselItems, scrollOffset, change) {
  const imagesToShow = 3;
  return (
    div('.carousel-images', carouselItems
      .slice(scrollOffset, scrollOffset + imagesToShow)
      .map((item, index) => renderImage(item.url, index, index + scrollOffset, change))
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
        button('.previous', {props: {'disabled': scroll === 0 }}, 'Previous'),
        button('.next', {props: {disabled: scroll === carouselItems.length - 3}}, 'Next'),
        renderCarousel(carouselItems, scroll, change)
      ])
    ),

    scroll$
  };
}

export default function App ({DOM}) {
  const carousel = Carousel({DOM});

  const text$ = carousel.scroll$.map(scroll => carouselItems[scroll].text);

  return {
    DOM: Observable.combineLatest(text$, carousel.DOM, (text, carouselDOM) =>
      div('.example', [
        carouselDOM,
        div('.text', text)
      ])
    )
  };
}
