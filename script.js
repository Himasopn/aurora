li// --- START: Unified pointer/mouse/touch handler (paste/replace existing handlers) ---

// ensure these exist from your original code:
const raycaster = raycaster || new THREE.Raycaster();
const pointer = pointer || new THREE.Vector2(); // normalized device coords
// renderer, camera, scene should already exist in your project

// make sure pointer events behave consistently on touch devices
if (renderer && renderer.domElement) {
  renderer.domElement.style.touchAction = 'none';
}

// helper: get normalized pointer coords relative to renderer DOM element
function getNormalizedPointer(event) {
  const el = renderer.domElement;
  const rect = el.getBoundingClientRect();

  // support PointerEvent and MouseEvent: use clientX/Y
  // support TouchEvent: use first touch's clientX/Y
  let clientX, clientY;
  if (event.touches && event.touches.length) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if (event.changedTouches && event.changedTouches.length) {
    clientX = event.changedTouches[0].clientX;
    clientY = event.changedTouches[0].clientY;
  } else {
    // PointerEvent or MouseEvent
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  return { x, y };
}

// shared handler: does the raycast and handles clicks on parts
function handlePointerInteraction(event) {
  // prevent default so touch doesn't also trigger synthetic mouse events
  if (event.preventDefault) event.preventDefault();

  const p = getNormalizedPointer(event);
  pointer.x = p.x;
  pointer.y = p.y;

  // update the raycaster and find intersections
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const first = intersects[0];
    // --- YOU MAY ALREADY HAVE SOME CODE HERE THAT HANDLES 'first.object' ---
    // call whatever existing function you had, e.g. onPartClicked(first.object, first);
    // If you don't have such a function, here's a safe default:
    if (typeof onPartClicked === 'function') {
      onPartClicked(first.object, first);
    } else {
      // simple default behavior for debugging:
      console.log('Clicked object:', first.object.name || first.object.id, first);
    }
  } else {
    // nothing intersected (optional)
    // console.log('No hit');
  }
}

// attach event listeners for all relevant event types
const eventsToListen = ['pointerdown', 'mousedown', 'touchstart', 'click'];
eventsToListen.forEach((evName) => {
  // attach to renderer DOM element so coordinates are correct
  renderer.domElement.addEventListener(evName, handlePointerInteraction, { passive: false });
});

// If your original code used window-level listeners, you can also add those:
// window.addEventListener('mouseup', handlePointerInteraction, { passive: false });

// --- END: Unified pointer/mouse/touch handler ---
