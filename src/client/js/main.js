import 'regenerator-runtime';
import '../scss/styles.scss';
const profileCircle = document.getElementById('navProfile');
const fileLabel = document.getElementById('fileLabel');
const thumbLabel = document.getElementById('thumbLabel');
const contentFile = document.getElementById('contentFile');
const thumbFile = document.getElementById('thumbFile');

const openSubMenu = (e) => {
  e.target.classList.add('openSub');
};
const closeSubMenu = (e) => {
  e.target.classList.remove('openSub');
};
const handleFileName = (e) => {
  fileLabel.value = contentFile.value;
};
const handleThumbName = (e) => {
  thumbLabel.value = thumbFile.value;
};

profileCircle.addEventListener('mouseleave', closeSubMenu);
profileCircle.addEventListener('mouseenter', openSubMenu);
contentFile.addEventListener('change', handleFileName);
thumbFile.addEventListener('change', handleThumbName);
