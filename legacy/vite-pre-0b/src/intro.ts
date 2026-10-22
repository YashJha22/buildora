import gsap from 'gsap';
import { S, reduce, st } from './state';
import { intro as T } from './tokens/motion';
import { $ } from './utils';

/** Preloader + hero intro. Unlocks scrolling (`st.ready`) when the timeline completes. */
export function startIntro() {
  const pre = $('#pre'),
    n = $('#n'),
    bar = $('#bar');
  if (reduce) {
    pre.style.display = 'none';
    S.intro = 1;
    S.build = 1;
    st.ready = true;
    $('.foot').style.opacity = String(T.footOpacity);
    return;
  }
  const c = { v: 0 },
    tl = gsap.timeline({
      defaults: { ease: T.defaultEase },
      onComplete() {
        st.ready = true;
      },
    });
  tl.to(c, {
    v: 100,
    duration: T.count.duration,
    ease: T.count.ease,
    onUpdate() {
      n.textContent = String(Math.round(c.v));
      bar.style.transform = `scaleX(${c.v / 100})`;
    },
  })
    .to('#pre .pw,#pre .pc,#pre .pbar', { opacity: 0, y: T.fade.y, duration: T.fade.duration, ease: T.fade.ease, stagger: T.fade.stagger })
    .to('#pre', { yPercent: -100, duration: T.curtain.duration, ease: T.curtain.ease }, T.curtain.at)
    .set(pre, { display: 'none' })
    .from('.ln>span', { yPercent: 115, duration: T.headline.duration, stagger: T.headline.stagger }, T.headline.at)
    .from('header,.eyebrow,.sub,.cta', { opacity: 0, y: T.chrome.y, duration: T.chrome.duration, stagger: T.chrome.stagger }, T.chrome.at)
    .to(S, { build: 1, duration: T.build.duration, ease: T.build.ease }, T.build.at)
    .to(S, { intro: 1, duration: T.reveal.duration, ease: T.reveal.ease }, T.reveal.at)
    .to('.foot', { opacity: T.footOpacity, duration: T.foot.duration, ease: T.foot.ease }, T.foot.at);
  $('#skip').onclick = () => {
    tl.timeScale(T.skipTimeScale);
  };
}
