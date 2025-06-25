In this project, we will implement a physically-based simulation using a mass-spring system.

As in the previous projects, you are given an HTML file that implements the user interface and a part of the JavaScript and WebGL code. The part you will implement as a part of this project is the simulation time stepping function below:

function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )

In addition, you will need to copy/paste the entire code you developed for Project "project4_Shading" to handle the display and shading functionalities. Here is a demo showing what the finished project should look like:

https://www.youtube.com/watch?time_continue=187&v=Kpep7eWHQBM&embeds_referring_euri=https%3A%2F%2Fgraphics.cs.utah.edu%2F&source_ve_path=MzY4NDIsMzY4NDIsMzY4NDIsMjg2NjY&feature=emb_logo

The SimTimeStep function takes the time step size (dt) and three arrays, mass particle positions, particle velocities, and springs, along with other simulation parameters. Its job is updating the positions and velocities arrays that initially contain the values at the beginning of the time step and set them to the values at the end of the time step. You are free to use any numerical integration technique you like (explicit Euler, semi-implicit Euler, etc.).

The arrays of positions and velocities contain one 3D vector object of JavaScript class Vec3 per mass particle. This class is provided to make the implementation of vector algebra easier. The implementation of the Vec3 class is included in the given project7.html file (at lines 538 to 569). You can access the x, y, z coordinates of a given Vec3 object (e.g. positions[0].x). It includes the following methods you can use:

init(x,y,z): sets the x, y, and z coordinates to the given values.
copy(): returns a copy of the vector object.
set(v): sets the x, y, and z coordinates to the same values as the given vector v.
inc(v): increments the x, y, and z coordinate values by adding the coordinate values of the given vector v.
dec(v): decrements the x, y, and z coordinate values by subtracting the coordinate values of the given vector v.
scale(f): multiplies the x, y, and z coordinates by the given scalar f.
add(v): add the given vector v to this vector and returns the resulting vector.
sub(v): subtracts the given vector v from this vector and returns the resulting vector.
dot(v): computes the dot product of this vector and the given vector v and returns the resulting scalar.
cross(v): computes the cross product of this vector and the given vector v and returns the resulting vector.
mul(f): multiplies the vector by the given scalar f and returns the result.
div(f): divides the vector by the given scalar f and returns the result.
len2(): returns the squared length of the vector.
len(): returns the length of the vector.
unit(): returns the unit vector along the direction of this vector.
normalize(): normalizes this vector, turning it into a unit vector.
The array of springs has an object per spring that contains the indices of the two particles it connects (p0 and p1) and the its rest length (rest).

The other parameters of the SimTimeStep function are the spring stiffness coefficient, the damping coefficient, the mass of each particle (particleMass, the same scalar mass value is used for each particle), the gravitational acceleration vector (gravity), and the restitution coefficient for collisions with the box walls.

The collision box is a cube centered at the origin with an edge length of 2 units. Thus, it extends from -1 to 1 in all three dimensions. The simulated object must remain inside this box and collide against its walls. Computing the self-collisions of the simulated object is not required.

You are given the following files to help you with this project:

project7.html: This file contains the implementation of the interface and various JavaScript/WebGL functionalities.
project7.js: This file contains the placeholder of the JavaScript function GetModelViewMatrix, class MeshDrawer, and function SimTimeStep that you will complete. This file is included by project7.html.
obj.js: This file implements the OBJ parser and it is included by project7.html. This file is an updated version of the same file included with the previous projects. It includes additional functionalities needed for this project.
teapot-low.obj: A low-resolution Utah Teapot model, suitable for real-time mass-spring simulation.
You can use the same OBJ files and textures from the previous project for testing your implementation.
