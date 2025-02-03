window.addEventListener('load', function () {
    const logoVideo = document.getElementById('logo-video');
    const logoImage = document.getElementById('logo-image');
    const threeJSContainer = document.getElementById('threejs-container');

    logoVideo.play();

    logoVideo.addEventListener('ended', function () {
        logoVideo.style.transition = 'opacity 0.55s ease';
        logoVideo.style.opacity = '0'; // Fade out the video smoothly
        setTimeout(() => {
            document.body.classList.add('loaded'); // Show the main content

            // Ensure threeJSContainer visibility
            threeJSContainer.style.display = 'block';
            threeJSContainer.style.opacity = '1';

            logoImage.style.opacity = '0'; // Start with opacity 0 to avoid instant appearance
            logoImage.style.display = 'block'; // Ensure the image is displayed for fading
            logoImage.classList.add('show'); // Start fading in the image
            logoVideo.style.display = 'none'; // Hide the video after fading out

            // Initialize Three.js and render the 3D objects after the content is fully loaded
            requestAnimationFrame(() => {
                initThreeJS();
            });
        }, 550); // Duration of the fade-out animation
    });


    // Function for smooth scrolling to a section
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    window.scrollToSection = scrollToSection;

    // Initialize Three.js Scene for 3D Objects in Home Section
    function initThreeJS() {
        const container = document.getElementById('threejs-container');

        container.style.width = '100%';
        container.style.height = '100%';

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000010);

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);


        const loader = new THREE.GLTFLoader();
        let iphone;
        let robot;
        let mixer;

        // Variables for hover effect
        let isRotating = false; // Track if rotation is in progress
        let hasCompletedRotation = false;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Event listeners for mouse movement and click
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        function onMouseMove(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        function onClick(event) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(robot, true);
            const intersects2 = raycaster.intersectObject(iphone, true);
            if (intersects.length > 0) {
                scrollToSection('projects'); // Smoothly scroll to the "Projects" section
            }
            if (intersects2.length > 0) {
                scrollToSection('contact'); // Smoothly scroll to the "Contact" section
            }
        }

        loader.load('assets/models/iphone16.glb', function (gltf) {
            iphone = gltf.scene;
            iphone.scale.set(0.5, 0.5, 0.48);
            function updateIphonePosition() {
                if (window.innerWidth <= 1024) {
                    iphone.visible = false; // Hide the iPhone model for smaller screens
                } else if (window.innerWidth < 1368) {
                    iphone.visible = true; // Ensure the iPhone model is visible
                    iphone.position.set(3.2, 0.3, 1.12);
                } else {
                    iphone.visible = true; // Ensure the iPhone model is visible
                    iphone.position.set(3.9, 0.3, 1.12);
                }
            }

            updateIphonePosition(); // Set initial position
            window.addEventListener('resize', updateIphonePosition); // Update position on resize

            iphone.rotation.x = 0.4;

            scene.add(iphone);
        }, undefined, function (error) {
            console.error("Error loading GLB model:", error);
        });

        loader.load('assets/models/githublogocircle.glb', function (gltf) {
            githublogo = gltf.scene;
            githublogo.scale.set(0.0035, 0.0035, 0.0035);

            function updateGithubLogoPosition() {
                if (window.innerWidth <= 1024) {
                    githublogo.visible = false; // Hide the logo for smaller screens
                } else if (window.innerWidth < 1368) {
                    githublogo.position.set(2.5, 1, 1);
                } else { // Desktop view
                    githublogo.position.set(3.1, 1.05, 1);
                }
            }

            updateGithubLogoPosition(); // Set initial position
            window.addEventListener('resize', updateGithubLogoPosition); // Update position on resize

            githublogo.rotation.x = 1.6;
            githublogo.rotation.y = -0.1;

            scene.add(githublogo);

            const rotationSpeed = 0.02; // Base rotation speed
            let moveUp = false;
            let isAnimating = false;
            let speedMultiplier = 1;
            const originalY = githublogo.position.y;

            function rotateGithubLogo() {
                // Rotate the logo
                githublogo.rotation.z += rotationSpeed * speedMultiplier;

                // Handle animation logic
                if (isAnimating) {
                    const direction = moveUp ? 1 : -1; // Determine movement direction
                    githublogo.position.y += 0.0005 * speedMultiplier * direction;
                    speedMultiplier = moveUp ? speedMultiplier + 0.5 : Math.max(speedMultiplier - 0.5, 1);

                    if (moveUp && githublogo.position.y > originalY + 0.5) {
                        moveUp = false; // Reverse direction
                    } else if (!moveUp && githublogo.position.y <= originalY) {
                        githublogo.position.y = originalY;
                        isAnimating = false;
                        speedMultiplier = 1;

                        // Schedule the next animation
                        setTimeout(() => {
                            moveUp = true;
                            isAnimating = true;
                        }, Math.random() * 5000 + 5000);
                    }
                }

                // Request the next frame
                requestAnimationFrame(rotateGithubLogo);
            }


            // Start the initial upward animation
            setTimeout(() => {
                moveUp = true;
                isAnimating = true;
            }, Math.random() * 5000 + 2000); // Initial delay

            rotateGithubLogo();


            // Existing mouse click event
            function onMouseClick(event) {
                // Convert mouse position to normalized device coordinates (-1 to +1)
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                // Update raycaster with camera and mouse position
                raycaster.setFromCamera(mouse, camera);

                // Check for intersections with the githublogo
                const intersects = raycaster.intersectObject(githublogo, true);
                if (intersects.length > 0) {
                    // Open GitHub page
                    window.open('https://github.com/kshithijm1', '_blank');
                }
            }

            // Add event listener for mouse click
            window.addEventListener('click', onMouseClick);


            function onMouseMove(event) {
                // Convert mouse position to normalized device coordinates (-1 to +1)
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                // Update raycaster with camera and mouse position
                raycaster.setFromCamera(mouse, camera);

                // Check for intersections with the githublogo
                const intersects = raycaster.intersectObject(githublogo, true);
                if (intersects.length > 0) {
                    // Change cursor to pointer
                    document.body.style.cursor = 'pointer';
                } else {
                    // Revert cursor to default
                    document.body.style.cursor = 'default';
                }
            }

            window.addEventListener('mousemove', onMouseMove, false);

            window.addEventListener('click', onMouseClick, false);
        }, undefined, function (error) {
            console.error("Error loading GLB model:", error);
        });

        // Load robot model
        loader.load('assets/models/scene.gltf', function (gltf) {
            robot = gltf.scene;
            robot.scale.set(0.5, 0.5, 0.5);

            function updateRobotPosition() {
                if (window.innerWidth <= 1024) {
                    robot.visible = false; // Hide the logo for smaller screens
                } else if (window.innerWidth < 1368) {
                    robot.position.set(0.7, 0.129, 3);
                    robot.rotation.y = -1;
                } else { // Desktop view
                    robot.position.set(1, 0.129, 3);
                }
            }

            updateRobotPosition(); // Set initial position
            window.addEventListener('resize', updateRobotPosition); // Update position on resize

            robot.rotation.y = -0.35;

            scene.add(robot);

            // Initialize the animation mixer
            mixer = new THREE.AnimationMixer(robot);

            // Get the animation clips and play the first one (or whichever you need)
            const clip = gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.setEffectiveTimeScale(0.25); // Set the animation speed to constant
            action.play();

            // Add a spotlight that affects only the robot model
            robotLight = new THREE.DirectionalLight(0xffffff, 1.5);
            robotLight.position.set(1, 0.5, 3.001);
            robotLight.angle = Math.PI / 6;
            robotLight.penumbra = 0.1;
            robotLight.decay = 2;
            robotLight.distance = 50;
            robotLight.castShadow = true;
            robotLight.target = robot;
            robotLight.layers.set(1); // Ensure it affects only the robot layer
            scene.add(robotLight);

        }, undefined, function (error) {
            console.error("Error loading GLB model:", error);
        });

        const objectsLayer = 1;


        // Helper function to create a mesh with common properties
        function createMesh(geometry, material, position, layer, scene) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(position.x, position.y, position.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.layers.set(layer);
            scene.add(mesh);
            return mesh;
        }

        // Common material to reuse
        const commonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // Cube
        const cube = createMesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            commonMaterial,
            { x: 3, y: -0.5, z: -1 },
            objectsLayer,
            scene
        );

        function updateCubePosition() {
            if (window.innerWidth <= 1024) {
                cube.visible = false; // Hide the logo for smaller screens
            } else if (window.innerWidth < 1368) {
                cube.position.x = 2; // Move to the left for smaller screens
            } else {
                cube.position.x = 3; // Original position for larger screens
            }
        }

        updateCubePosition(); // Set initial position
        window.addEventListener('resize', updateCubePosition); // Update position on resize

        // Prism
        const prism = createMesh(
            new THREE.BoxGeometry(1.245, 2.245, 1.245),
            commonMaterial,
            { x: 5, y: -0.3, z: -1.5 },
            objectsLayer,
            scene
        );

        function updatePrismPosition() {
            if (window.innerWidth <= 1024) {
                prism.visible = false; // Hide the logo for smaller screens
            } else if (window.innerWidth < 1368) {
                prism.position.x = 4; // Move to the left for smaller screens
            } else {
                prism.position.x = 5; // Original position for larger screens
            }
        }

        updatePrismPosition(); // Set initial position
        window.addEventListener('resize', updatePrismPosition); // Update position

        // Cube2
        const cube2 = createMesh(
            new THREE.BoxGeometry(1, 1, 1),
            commonMaterial,
            { x: 4, y: -0.74, z: 0.9 },
            objectsLayer,
            scene
        );

        function updateCube2Position() {
            if (window.innerWidth <= 1024) {
                cube2.visible = false; // Hide the logo for smaller screens
            } else if (window.innerWidth < 1368) {
                cube2.position.x = 3.25; // Move to the left for smaller screens
            } else {
                cube2.position.x = 4; // Original position for larger screens
            }
        }

        updateCube2Position(); // Set initial position
        window.addEventListener('resize', updateCube2Position); // Update position

        // Preload water texture
        const waterNormals = new THREE.TextureLoader().load(
            'https://threejs.org/examples/textures/waternormals.jpg',
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        );

        // Create water
        const waterGeometry = new THREE.PlaneGeometry(30, 10);
        const water = new THREE.Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: waterNormals,
            alpha: 0.9,
            sunDirection: new THREE.Vector3(-0.2, 1, 0.2),
            sunColor: 0xccccff,
            waterColor: 0x001f4d,
            distortionScale: 1.0,
            fog: scene.fog !== undefined
        });
        water.rotation.x = -Math.PI / 2;
        water.position.y = -1.5;
        scene.add(water);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x202040, 0.5);
        ambientLight.layers.set(objectsLayer);
        scene.add(ambientLight);

        const moonLight = new THREE.DirectionalLight(0xffffff, 0.8);
        moonLight.position.set(-10, 10, -10);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(1024, 1024); // Reduced shadow resolution
        scene.add(moonLight);

        const objectLight = new THREE.PointLight(0xffffff, 1.5, 10);
        objectLight.position.set(2, 2, 2);
        objectLight.layers.set(objectsLayer);
        scene.add(objectLight);


        camera.layers.enable(objectsLayer);

        // Function to create a star field
        function createStarField(scene, starCount, spread, color, sizeRange, positionOffset) {
            const starVertices = Array.from({ length: starCount * 2 }, () => THREE.MathUtils.randFloatSpread(spread));
            const starSizes = Array.from({ length: starCount }, () => THREE.MathUtils.randFloat(sizeRange.min, sizeRange.max));

            // Create geometry and assign attributes
            const starGeometry = new THREE.BufferGeometry();
            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
            starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

            // Define material for the stars
            const starMaterial = new THREE.PointsMaterial({
                color: color,
                size: 0.1,
                sizeAttenuation: true,
            });

            // Create the star field and apply position offset
            const stars = new THREE.Points(starGeometry, starMaterial);
            if (positionOffset) {
                stars.position.copy(positionOffset);
            }
            scene.add(stars);

            return stars;
        }

        // Add primary star field
        createStarField(scene, 400, 200, 0xffffff, { min: 0.1, max: 0.2 });

        // Add reflected star field
        createStarField(scene, 400, 200, 0xffffff, { min: 0.1, max: 0.2 }, new THREE.Vector3(0, -2, 0));


        let speedMultiplier = 20; // Default speed is 1 (normal speed)

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            // Calculate delta time
            const deltaTime = clock.getDelta(); // Time since last frame in seconds

            // Make the iPhone spin on the Y-axis
            if (iphone) {
                iphone.rotation.y += 0.09 * deltaTime * speedMultiplier; // Adjust rotation speed using deltaTime
            }

            // Update water animation
            water.material.uniforms['time'].value += deltaTime * speedMultiplier * (1.0 / 700.0);

            // Update the animation mixer
            if (mixer) {
                mixer.update(deltaTime * speedMultiplier); // Use deltaTime to ensure consistent speed
            }

            // Update raycaster based on camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            // Check for intersections with the robot
            if (robot) {
                const intersects = raycaster.intersectObject(robot, true);

                if (intersects.length > 0 && !isRotating && !hasCompletedRotation) {
                    isRotating = true;
                    robot.userData.targetRotationY = robot.rotation.y + Math.PI * 2; // Rotate 360 degrees
                    robot.userData.rotationSpeed = 40; // Adjust rotation speed
                }

                // Handle robot rotation
                if (isRotating) {
                    if (robot.rotation.y < robot.userData.targetRotationY) {
                        robot.rotation.y += robot.userData.rotationSpeed * 0.01;
                    } else {
                        robot.rotation.y = robot.userData.targetRotationY % (Math.PI * 2);
                        isRotating = false;
                        hasCompletedRotation = true;
                    }
                }

                if (intersects.length === 0) {
                    hasCompletedRotation = false;
                }

                renderer.render(scene, camera);
            }

            // Handle window resize
            window.addEventListener('resize', function () {
                const width = container.clientWidth;
                const height = container.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
            });
        }

        animate();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.getElementById('about');
    const aboutHeading = document.getElementById('about-me-heading');
    const introHeading = document.getElementById('intro-text-heading');
    const interestsBox = document.getElementById('interests-box');
    let hasAnimated = false;
    let timer = null;

    const observerOptions = {
        root: null,
        threshold: 0.75,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
                timer = setTimeout(() => {
                    hasAnimated = true;

                    // Animate the "About Me" text first
                    setTimeout(() => {
                        const text = aboutHeading.textContent;
                        aboutHeading.innerHTML = '';
                        text.split('').forEach((letter, index) => {
                            const span = document.createElement('span');
                            span.textContent = letter === ' ' ? '\u00A0' : letter;
                            span.style.animationDelay = `${index * 0.03}s`;
                            aboutHeading.appendChild(span);
                        });

                        // Adjust the position of the "About Me" text based on screen size
                        function updateAboutHeadingPosition() {
                            if (window.innerWidth < 1368) {
                                aboutHeading.style.top = '6%'; // Smaller top margin for smaller screens
                            } else {
                                aboutHeading.style.top = '6%'; // Original top margin for larger screens
                            }
                        }

                        updateAboutHeadingPosition(); // Set initial position
                        window.addEventListener('resize', updateAboutHeadingPosition); // Update position on resize

                        setTimeout(() => {
                            aboutHeading.style.opacity = 0;
                            introHeading.style.opacity = 1;
                            introHeading.style.position = 'absolute';
                            introHeading.style.top = '30%';
                            introHeading.style.left = '50%';
                            introHeading.style.transform = 'translate(-50%, -50%)';
                            introHeading.innerHTML = '';

                            const introText = "A Second Year Engineering Student";
                            introText.split('').forEach((letter, index) => {
                                const span = document.createElement('span');
                                span.textContent = letter === ' ' ? '\u00A0' : letter;
                                span.style.animationDelay = `${index * 0.03}s`;

                                // Change the font size based on screen width
                                if (window.innerWidth <= 1024) {
                                    span.style.fontSize = '2.7rem'; // Smaller font size for smaller screens
                                } else if (window.innerWidth < 1368) {
                                    span.style.fontSize = '4rem'; // Medium font size for medium screens
                                } else {
                                    span.style.fontSize = '5rem'; // Original font size for larger screens
                                }

                                introHeading.appendChild(span);
                            });

                            setTimeout(() => {
                                introHeading.style.transition = 'all 1s ease';
                                introHeading.style.top = '-5%';
                                introHeading.style.left = '50%';
                                introHeading.style.transform = 'translate(-50%, 0)';
                                introHeading.style.backgroundColor = 'white';
                                introHeading.style.color = 'black';

                                const additionalText = document.createElement('h1');
                                additionalText.textContent = "Studying at the University of Guelph\nas a Systems and Computing Engineer";
                                additionalText.style.color = 'white';
                                additionalText.style.textAlign = 'center';
                                additionalText.style.marginTop = '9.7%';
                                additionalText.style.fontSize = '2rem';
                                additionalText.style.opacity = '0';
                                additionalText.style.transition = 'opacity 1s ease';
                                additionalText.style.whiteSpace = 'pre-line';
                                additionalText.style.fontWeight = '350';
                                if (window.innerWidth <= 1024) {
                                    additionalText.style.marginTop = '9rem'; // Smaller margin for smaller screens
                                } else if (window.innerWidth < 1368) {
                                    additionalText.style.marginTop = '13.13rem'; // Medium margin for medium screens
                                } else {
                                    additionalText.style.marginTop = '15rem'; // Original margin for larger screens
                                }
                                aboutSection.appendChild(additionalText);

                                setTimeout(() => {
                                    additionalText.style.opacity = '1';
                                    setTimeout(() => {
                                        additionalText.style.opacity = '1';

                                        // Create the first interest box
                                        const interestBox1 = document.createElement('div');
                                        interestBox1.className = 'interest-box'; // Use a shared class for styling
                                        interestBox1.innerHTML = `
                                            <h2>Interests</h2><br>
                                            Machine Learning<br>
                                            Artificial Intelligence<br>
                                            UX Design<br>
                                            Robotics<br>
                                            Automation<br>
                                            Augmented Reality<br>
                                            Neural Networks
                                        `;

                                        // Create the second interest box
                                        const interestBox2 = document.createElement('div');
                                        interestBox2.className = 'interest-box'; // Use the same class
                                        interestBox2.innerHTML = `
                                            <h2>Languages I Speak</h2><br>
                                            Python<br>
                                            ROS<br>
                                            C<br>
                                            Java<br>
                                            Javascript<br>
                                            HTML<br>
                                            CSS
                                        `;

                                        // Create the second interest box
                                        const interestBox3 = document.createElement('div');
                                        interestBox3.className = 'interest-box'; // Use the same class
                                        interestBox3.innerHTML = `
                                        <h2>Skills</h2><br>
                                        AutoCAD<br>
                                        SolidWorks<br>
                                        Adobe Photoshop<br>
                                        Premiere Pro<br>
                                        After Effects<br>
                                        Blender Animations<br>
                                        MATLAB
                                        `;

                                        // Create a container for both boxes
                                        const interestBoxContainer = document.createElement('div');
                                        interestBoxContainer.id = 'interest-box-container'; // Add an ID for container styling
                                        interestBoxContainer.appendChild(interestBox1);

                                        const interestBoxContainer2 = document.createElement('div');
                                        interestBoxContainer2.id = 'interest-box-container2'; // Add an ID for container styling
                                        interestBoxContainer2.appendChild(interestBox2);

                                        const interestBoxContainer3 = document.createElement('div');
                                        interestBoxContainer3.id = 'interest-box-container3'; // Add an ID for container styling
                                        interestBoxContainer3.appendChild(interestBox3);

                                        // Append the container after the additional text
                                        aboutSection.appendChild(interestBoxContainer);
                                        aboutSection.appendChild(interestBoxContainer2);
                                        aboutSection.appendChild(interestBoxContainer3);
                                    }, 500);


                                }, 500);
                            }, 1000);
                        }, 1000);
                    }, 50);
                }, 400);
            } else {
                clearTimeout(timer);
                timer = null;
            }
        });
    }, observerOptions);

    observer.observe(aboutSection);
});


document.addEventListener("DOMContentLoaded", () => {
    const projects = document.querySelectorAll(".project");
    const hoverTextContainer = document.getElementById("project-hover-text");

    projects.forEach(project => {
        project.addEventListener("mouseenter", () => {
            const projectText = project.getAttribute("data-text");
            hoverTextContainer.textContent = projectText;
        });

        project.addEventListener("mouseleave", () => {
            hoverTextContainer.textContent = ""; // Clear the text when not hovering
        });
    });
});


function scrollToSectionbuttons(sectionId, event) {
    // Prevent default anchor behavior
    event.preventDefault();

    // Find the target section
    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
        // Scroll smoothly to the target section
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}