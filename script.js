// Adding a slight random rotation to menu items for that "messy" look
document.querySelectorAll('.menu-item').forEach(item => {
    const randomRot = (Math.random() - 0.5) * 3; // Random degrees between -1.5 and 1.5
    item.style.transform = `rotate(${randomRot}deg)`;
});

// Adding a flicker effect to the red price boxes
const redBoxes = document.querySelectorAll('.price-box');
setInterval(() => {
    const target = redBoxes[Math.floor(Math.random() * redBoxes.length)];
    target.style.opacity = '0.8';
    setTimeout(() => target.style.opacity = '1', 50);
}, 3000);