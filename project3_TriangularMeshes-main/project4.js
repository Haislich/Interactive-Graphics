// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	// [TO-DO] Modify the code below to form the transformation matrix.
	const cosX = Math.cos(rotationX)
	const sinX = Math.sin(rotationX)

	const cosY = Math.cos(rotationY)
	const sinY = Math.sin(rotationY)

	var rotX = [
		1, 0, 0, 0,
		0, cosX, sinX, 0,
		0, -sinX, cosX, 0,
		0, 0, 0, 1
	];

	var rotY = [
		cosY, 0, -sinY, 0,
		0, 1, 0, 0,
		sinY, 0, cosY, 0,
		0, 0, 0, 1
	];
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var mvp = MatrixMult(projectionMatrix, MatrixMult(trans, MatrixMult(rotX, rotY)));

	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {

	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		// [TO-DO] initializations
		// https://stackoverflow.com/questions/18111993/shaders-best-practice-to-store-them#:~:text=This%20technique%20is,aVertexPosition%2C%201.0)%3B%0A%7D%60%3B

		const meshVS = `
            attribute vec3 pos;
            attribute vec2 textureCoordinates;

            uniform mat4  mvp;
            uniform bool  swapYZ;

            varying vec2  v_textureCoordinates;

            void main( void )
            {
                vec3 p = pos;
                if ( swapYZ )  p = vec3( p.x, p.z, p.y );

                gl_Position = mvp * vec4( p, 1.0 );
                v_textureCoordinates = textureCoordinates;
            }`;

		const meshFS = `
            precision mediump float;

            varying vec2  v_textureCoordinates;
            uniform sampler2D texture;
            uniform bool     useTexture;

            void main( void )
            {
                if ( useTexture )
                    gl_FragColor = texture2D(texture, v_textureCoordinates );
                else
                    gl_FragColor = vec4( 1.0,
                                         gl_FragCoord.z * gl_FragCoord.z,
                                         0.0, 1.0 );
            }`;
		this.prog = InitShaderProgram(meshVS, meshFS);
		// Uniform definitions
		// https://thebookofshaders.com/glossary/?search=uniform

		// Model View Projection, transforms the object space coordinates 
		// into clip space, where essentially the screen is drawn
		// https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
		this.u_mvp = gl.getUniformLocation(this.prog, 'mvp');
		// Wheter to swap Y and Z
		this.u_swapYZ = gl.getUniformLocation(this.prog, 'swapYZ');
		this.u_useTexture = gl.getUniformLocation(this.prog, 'useTexture');

		this.u_sampler = gl.getUniformLocation(this.prog, 'tex');

		// Attributte definitions
		// https://thebookofshaders.com/glossary/?search=attribute
		this.a_pos = gl.getAttribLocation(this.prog, 'pos');
		this.a_textureCoordinates = gl.getAttribLocation(this.prog, 'textureCoordinates');

		this.posBuffer = gl.createBuffer();
		this.tcBuffer = gl.createBuffer();
		this.texture = gl.createTexture();

		gl.useProgram(this.prog);
		// no swap by default
		gl.uniform1i(this.u_swapYZ, 0);
		// show texture if we have one
		gl.uniform1i(this.u_useTexture, 1);
		// texture unit 0
		gl.uniform1i(this.u_sampler, 0);

		this.numVerts = 0;
		this.hasTexCoords = false;

		// initialise empty 1×1 white texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
			1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE,
			new Uint8Array([255, 255, 255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,
			new Float32Array(vertPos),
			gl.STATIC_DRAW);

		this.numVerts = vertPos.length / 3;

		// texture coordinates ------------------------------------------------
		this.hasTexCoords = (texCoords && texCoords.length);
		if (this.hasTexCoords) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.tcBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,
				new Float32Array(texCoords),
				gl.STATIC_DRAW);
		}
	}

	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_swapYZ, swap ? 1 : 0);
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		// [TO-DO] Complete the WebGL initializations before drawing
		if (this.numVerts === 0) return;          // nothing yet

		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.u_mvp, false, trans);

		// --- position attribute --------------------------------------------
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.vertexAttribPointer(this.a_pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.a_pos);

		// --- tex-coord attribute (if present) ------------------------------
		if (this.hasTexCoords) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.tcBuffer);
			gl.vertexAttribPointer(this.a_textureCoordinates, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(this.a_textureCoordinates);
		}
		else {   // disable to avoid stale state
			gl.disableVertexAttribArray(this.a_textureCoordinates);
		}

		// --- texture -------------------------------------------------------
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// --- draw -----------------------------------------------------------
		gl.drawArrays(gl.TRIANGLES, 0, this.numVerts);
	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		// [TO-DO] Bind the texture

		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// You can set the texture image data using the following command.
		// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
			gl.RGB, gl.UNSIGNED_BYTE, img,);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		// ensure the fragment shader samples the new texture
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_useTexture, 1);
	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_useTexture, show ? 1 : 0);
	}

}
