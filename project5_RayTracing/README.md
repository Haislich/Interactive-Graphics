# project5_RayTracing
In this project we will implement a software ray tracer that runs on the GPU.

The ray tracer will be implemented using GLSL as the programming language. You are given an HTML file that implements the user interface and the entire JavaScript and WebGL code. The only part missing is the GLSL code you will write for ray tracing. Here is a short demo of the project:
https://graphics.cs.utah.edu/courses/cs4600/fall2023/?prj=6
The scenes will be rendering will be different collections of spheres and point lights. The application has three rendering modes:

Rasterization: The rasterization mode is fully implemented. It lacks shadows and proper reflections of the spheres on the other spheres. All spheres are approximated as triangular meshes.
Ray Tracing: The ray tracing mode renders the entire image using ray tracing. Therefore, it will not work until you complete your implementation of the ray tracer. The rendering in this mode begins with drawing a quad (two triangles) that covers the entire screen. For each pixel of the screen, a fragment shader is called that performs ray tracing. It is this ray tracing operation inside the fragment shader that performs the actual rendering of the scene. In that sense, the ray tracing mode uses rasterization to draw a quad and the rendering is done inside the fragment shader for that quad. The GLSL code you will write for ray tracing will be included inside this fragment shader. This fragment shader will call the RayTracer GLSL function you will implement.
Rasterization + Ray Tracing: In this mode the rendering is handled using rasterization. Ray tracing is used for computing reflections and shadows only. The fragment shader in this mode will call the RayTracer and Shade GLSL functions you will implement.
You are given the following files to help you with this project:

project6.html: This file contains the implementation of the interface, including the JavaScript/WebGL components.
project6.js: This file contains the GLSL code you will complete as a JavaScript string. It is included by project6.html.
A portion of the GLSL code in the project6.js file is already written to aid your implementation. You must complete the implementations of the three GLSL functions RayTracer, IntersectRay, and Shade.

Useful tip: Pressing the F4 key reloads the project6.js file and recompiles the related shaders without reloading the page, so you can quickly test your implementation.
