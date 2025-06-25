// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix(translationX, translationY, translationZ, rotationX, rotationY) {
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rot_x = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), -Math.sin(rotationX), 0,
		0, Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	var rot_y = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];

	var rot = MatrixMult(rot_y, rot_x);

	var roto_translation = MatrixMult(trans, rot);
	return roto_translation;
}


const FLIP = new Float32Array([
	1, 0, 0, 0,
	0, 0, 1, 0,
	0, 1, 0, 0,
	0, 0, 0, 1
]);

const IDENTITY = new Float32Array([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
]);


class MeshDrawer {
	constructor() {
		this.prog = InitShaderProgram(this.vertex_shader, this.fragment_shader);
		gl.useProgram(this.prog);

		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.mvn = gl.getUniformLocation(this.prog, 'mvn');
		this.light = gl.getUniformLocation(this.prog, 'light');
		this.shininess = gl.getUniformLocation(this.prog, 'shininess');
		this.flip_YZ = gl.getUniformLocation(this.prog, 'flip_YZ');
		this.show_texture = gl.getUniformLocation(this.prog, 'show_texture');

		// lights
		this.light_direction = [1.0, 1.0, 1.0];
		gl.uniform3fv(this.light, new Float32Array(this.light_direction));

		this.shininess_value = document.getElementById('shininess-exp').value;
		gl.uniform1f(this.shininess, parseFloat(this.shininess_value));

		if (document.getElementById('swap_yz')) {
			gl.uniformMatrix4fv(this.flip_YZ, false, FLIP);
		} else {
			gl.uniformMatrix4fv(this.flip_YZ, false, IDENTITY);
		}

		gl.uniform1i(this.show_texture, document.getElementById('show-texture').checked ? 1 : 0);

		this.vertex = gl.getAttribLocation(this.prog, 'vertex');
		this.texture_coordinates = gl.getAttribLocation(this.prog, 'texture_coordinates');
		this.normal = gl.getAttribLocation(this.prog, 'normal');

		//buffers
		this.vertex_buffer = gl.createBuffer();
		this.texture_coordinates_buffer = gl.createBuffer();
		this.normal_buffer = gl.createBuffer();
	}

	setMesh(vertPos, texCoords, normals) {
		gl.useProgram(this.prog);


		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coordinates_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		this.numVertexes = vertPos.length / 3;
	}

	swapYZ(swap) {
		gl.useProgram(this.prog);
		if (swap) {
			gl.uniformMatrix4fv(this.flip_YZ, false, FLIP);
		} else {
			gl.uniformMatrix4fv(this.flip_YZ, false, IDENTITY);
		}
	}

	draw(matrixMVP, matrixMV, matrixNormal) {
		gl.useProgram(this.prog);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
		gl.vertexAttribPointer(this.vertex, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertex);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coordinates_buffer);
		gl.vertexAttribPointer(this.texture_coordinates, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.texture_coordinates);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
		gl.vertexAttribPointer(this.normal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normal);

		gl.uniformMatrix4fv(this.mv, false, matrixMV);
		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
		gl.uniformMatrix3fv(this.mvn, false, matrixNormal);

		gl.uniform3fv(this.light, new Float32Array(this.light_direction));

		// camera position
		var cam = [matrixMV[12], matrixMV[13], matrixMV[14], 1.0];
		gl.uniform4fv(gl.getUniformLocation(this.prog, 'camera'), new Float32Array(cam));

		gl.uniform1f(this.shininess, parseFloat(this.shininess_value));

		gl.drawArrays(gl.TRIANGLES, 0, this.numVertexes);
	}

	setTexture(img) {
		gl.useProgram(this.prog);
		var tex = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.uniform1i(gl.getUniformLocation(this.prog, 'texture'), 0);
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.show_texture, show ? 1 : 0);
	}

	setLightDir(x, y, z) {
		this.light_direction = [x, y, z];
	}

	setShininess(shininess) {
		this.shininess_value = shininess;
	}

	vertex_shader = `
        uniform mat4 mv;
        uniform mat4 mvp;
        uniform mat4 flip_YZ;
        uniform mat3 mvn;
        uniform bool show_texture;

        attribute vec2 texture_coordinates;
        attribute vec3 normal;
        attribute vec3 vertex;

        varying vec2 v_uv;
        varying vec3 v_n;
        varying vec4 v_pos;

        void main() {
            vec4 v = vec4(vertex, 1.0);
            gl_Position = mvp * flip_YZ * v;
            v_n = (mv * flip_YZ * vec4(normal, 0.0)).xyz;
            v_pos = mv * flip_YZ * v;
            v_uv = texture_coordinates;
        }
    `;

	fragment_shader = `
        precision mediump float;

        uniform bool show_texture;
        uniform float shininess;
        uniform vec3 light;
        uniform sampler2D texture;

        varying vec2 v_uv;
        varying vec3 v_n;
        varying vec4 v_pos;

        void main() {
            vec3 N = normalize(v_n);
            vec3 L = normalize(light);
            float diff = max(dot(N, L), 0.0);
            vec4 kd;
            if (show_texture) {
                kd = texture2D(texture, v_uv);
            } else {
                kd = vec4(0.2, 0.2, 0.7, 1.0);
            }
            vec3 R = reflect(-L, N);
            vec3 V = normalize(-v_pos.xyz);
            float spec = pow(max(dot(R, V), 0.0), shininess);
            vec3 ks = vec3(0.3); 
			vec3 ambient = kd.rgb * 0.2;
			vec3 diffuse = kd.rgb * diff;
			vec3 specular = ks * spec;

			vec3 finalColor = ambient + diffuse + specular;
			gl_FragColor = vec4(finalColor, kd.a);
        }
    `;
}



// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
// Advances the simulation by `dt`

function SimTimeStep(dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution) {
	var gravity_force = gravity.copy();
	gravity_force.scale(particleMass);
	var forces = new Array(positions.length).fill(gravity_force);

	// Calculate spring forces on points
	springs.map((s, i) => {
		// Get the ends of the spring, and their velocities
		var p0_pos = positions[s.p0].copy();
		var p0_vel = velocities[s.p0].copy();
		var p1_pos = positions[s.p1].copy();
		var p1_vel = velocities[s.p1].copy();

		// Determine the cosine direction of the spring force
		var spring_vector = p1_pos.sub(p0_pos);
		p0_pos.d = spring_vector.copy();
		p0_pos.d.normalize();

		p1_pos.d = p0_pos.d.copy();
		p1_pos.d.scale(-1.0);

		spring_vector = spring_vector.len();

		// Calculate the force direction scalar
		var spring_diff = spring_vector - s.rest;
		var spring_force_scalar = stiffness * spring_diff;

		// Add force to the points
		p0_pos.force = p0_pos.d.copy();
		p0_pos.force.scale(spring_force_scalar);
		p1_pos.force = p1_pos.d.copy();
		p1_pos.force.scale(spring_force_scalar);

		forces[s.p0] = forces[s.p0].add(p0_pos.force);
		forces[s.p1] = forces[s.p1].add(p1_pos.force);

		// Approximate the previous of the points, by subtracting their velocities
		var prev_p0 = p0_pos.sub(p0_vel);
		var prev_p1 = p1_pos.sub(p1_vel);
		var prev_spring_vector = prev_p0.sub(prev_p1);
		prev_spring_vector = prev_spring_vector.len();
		var spring_rate = spring_vector - prev_spring_vector;

		// Calculate the Damping Force
		var spring_damp_scalar = damping * spring_rate;
		p0_pos.force = p0_pos.d.copy();
		p0_pos.force.scale(spring_damp_scalar);
		p1_pos.force = p1_pos.d.copy();
		p1_pos.force.scale(spring_damp_scalar);

		forces[s.p0] = forces[s.p0].add(p0_pos.force);
		forces[s.p1] = forces[s.p1].add(p1_pos.force);
	});

	// Update velocities
	velocities.forEach((v, i) => {
		var force = forces[i].copy();
		var acceleration = force.div(particleMass);
		acceleration.scale(dt);
		v = v.add(acceleration);
		velocities[i] = v;
	});

	// Update positions
	positions.forEach((p, i) => {
		var v = velocities[i].copy();
		v.scale(dt);
		p = p.add(v);
		positions[i] = p;
	});


	// Collision detection and response with a bounding box at [-1, 1] on each axis
	positions.forEach((p, i) => {
		['x', 'y', 'z'].forEach(axis => {
			const limit = 1;
			const pos = p[axis];
			const over = Math.abs(pos) - limit;
			if (over > 0) {
				// If particle is outside the box, move it back inside and reverse velocity with restitution
				const sign = pos > 0 ? -1 : 1;
				positions[i][axis] = pos + sign * (over + restitution * over);
				velocities[i][axis] *= -restitution;
			}
		});
	});

}

