export function slider(){
  let slideIndex = 0;
  const sliderIcons = document.querySelectorAll('.slider_buttons ul li i');
  carousel();
  function carousel(){
    const slides = document.querySelectorAll('.slide');
    for(let i = 0; i < slides.length; i++){
      // slides[i].style.display = 'none';
      slides[i].classList.add('noShow');
      slides[i].classList.remove('show');
      sliderIcons[i].classList.remove('active_slide');
    }

    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    // slides[slideIndex-1].style.display = 'flex';
    slides[slideIndex-1].classList.add('show');
    slides[slideIndex-1].classList.remove('noShow');
    sliderIcons[slideIndex-1].classList.add('active_slide');
    setTimeout(carousel, 5000);
  }

  for(let id = 0; id < sliderIcons.length; id++){
    const slides = document.querySelectorAll('.slide');
    let slide = document.getElementById(id);
    sliderIcons[id].addEventListener('click', ()=> {
      event.preventDefault();
      for (let noShow of slides){noShow.classList.remove('show');}
      for(let icon of sliderIcons){icon.classList.remove('active_slide');}
      sliderIcons[id].classList.add('active_slide');
      slide.classList.add('show');
      console.log(sliderIcons[id]);
    });
  }

}
