const commentForm = document.getElementById('commentForm');
const commentUl = document.getElementById('commentUl');
const videoContainer = document.getElementById('videoContainer');
const deleteComment = document.querySelectorAll('.deleteComment');

const appendComment = (text, newCommentId, user, newCommentOwnerID) => {
  const newComment = document.createElement('li');
  newComment.dataset.id = newCommentId;
  newComment.dataset.ownerid = newCommentOwnerID;
  const userImg = document.createElement('img');
  userImg.src = user.profileImg;
  const writeBox = document.createElement('div');
  newComment.appendChild(userImg);
  newComment.appendChild(writeBox);
  const userName = document.createElement('span');
  const commentText = document.createElement('p');
  const deleteBtn = document.createElement('span');
  deleteBtn.className = 'deleteComment';
  deleteBtn.innerText = '삭제';
  userName.innerText = user.userName;
  commentText.innerText = text;
  newComment.appendChild(deleteBtn);
  writeBox.appendChild(userName);
  writeBox.appendChild(commentText);
  commentUl.prepend(newComment);

  const deleteComment = document.querySelectorAll('.deleteComment');
  deleteComment.forEach((btn) => btn.addEventListener('click', handleDelete));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = commentForm.querySelector('#commentTextarea');
  const text = textarea.value;
  if (text === '') {
    return;
  }
  const videoID = videoContainer.dataset.id;
  const response = await fetch(`/api/content/${videoID}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = '';
    const resData = await response.json();
    appendComment(
      text,
      resData.newCommentId,
      resData.user,
      resData.newCommentOwnerID
    );
  }
};

const handleDelete = async (e) => {
  const newCommentID = e.target.parentNode.dataset.id;
  const ownerID = e.target.parentNode.dataset.ownerid;
  console.log(e.target.parentNode);
  e.target.parentNode.remove();
  const videoID = videoContainer.dataset.id;
  await fetch(`/api/content/${videoID}/comment/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newCommentID, ownerID }),
  });
  return;
};

commentForm.addEventListener('submit', handleSubmit);
deleteComment.forEach((btn) => btn.addEventListener('click', handleDelete));
