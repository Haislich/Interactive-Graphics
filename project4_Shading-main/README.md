# project4_Shading
In this project we will add shading to the WebGL-based triangular mesh rendered we implemented in the previous project. You can read the instructions and see an example of the expected behavior at this link:
https://graphics.cs.utah.edu/courses/cs4600/fall2023/?prj=5

Again, you are given an HTML file that implements the user interface and a part of the JavaScript and WebGL code. The part you will implement is the same MeshDrawer class you implemented in the previous project. Therefore, you can copy and paste most of your implementation from the previous project. The new version of the MeshDrawer class in this project has just a few additions to facilitate shading:

The setMesh method in the new version also takes a list of vertex normals. These vertex normals should be sent to the vertex shader as another attribute.
setMesh( vertPos, texCoords, normals )

The draw method now takes three matrices: a 4x4 model-view-projection matrix (as before), a 4x4 model-view matrix, and a 3x3 normal transformation matrix. All matrices are stored as arrays in column-major order, as before. The last two additional matrices should be used for transforming object-space vertex positions and normals to the camera space, where you can perform shading.
draw( matrixMVP, matrixMV, matrixNormal )

The new setLightDir method is called by the interface for setting the light direction in camera space. If you perform shading in the camera space, you do not need to transform the light direction.
setLightDir( x, y, z )

The new setShininess method is called by the interface for setting the shininess parameter (i.e. the exponent alpha) of the Blinn material model.
setShininess( shininess )

In addition to these changes, the GetModelViewProjection function from the previous project is replaced with the new GetModelViewMatrix function. This new one does not take the projection matrix as an argument, and so returns the part of the transformation prior to projection.

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
After modifying your code from the previous project to account for these relatively minor changes above, all you need to do is to implement shading in the fragment shader. We will use the Blinn material model for shading. Here is a short video showing what the successfully completed project should look like:


We will use a single directional light with the given direction. The updated interface for this project includes a custom control for adjusting the light direction. The light intensity (I) should be taken as white, i.e. (1,1,1) in RGB.

Using an ambient light is optional. The interface does not include any controls about the ambient light.

The interface allows adjusting the shininess (i.e. the exponent alpha) of the Blinn material model. The diffuse and specular color coefficients (Kd and Ks) should be taken as white. If showTexture is set and setTexture is called, the diffuse coefficient (Kd) should be replaced by the texture value.

You are given the following files to help you with this project:

project5.html: This file contains the implementation of the interface and various JavaScript/WebGL functionalities.
project5.js: This file contains the placeholder of the JavaScript function GetModelViewMatrix and class MeshDrawer that you will complete. This file is included by project5.html.
obj.js: This file implements the OBJ parser and it is included by project5.html. This file is identical to the one included with the previous project.
You can use the same OBJ files and textures from the previous project for testing your implementation.
