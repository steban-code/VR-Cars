(function(){
  const track = document.getElementById('track');
  const slides = track.children.length;
  const dotsWrap = document.getElementById('dots');
  let i = 0;
  for(let s=0;s<slides;s++){
    const d = document.createElement('button');
    d.className = 'dot'+(s===0?' active':'');
    d.addEventListener('click', ()=>go(s));
    dotsWrap.appendChild(d);
  }
  function go(n){
    i = (n+slides)%slides;
    track.style.transform = 'translateX(-'+(i*100)+'%)';
    [...dotsWrap.children].forEach((d,idx)=>d.classList.toggle('active', idx===i));
  }
  document.querySelector('.carrusel-btn.prev').addEventListener('click', ()=>go(i-1));
  document.querySelector('.carrusel-btn.next').addEventListener('click', ()=>go(i+1));
})();
