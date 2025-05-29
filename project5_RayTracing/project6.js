var raytraceFS = `
struct Ray
{
    vec3 pos;
    vec3 dir;
};

struct Material
{
    vec3 k_d; // diffuse coefficient
    vec3 k_s; // specular coefficient
    float n;  // specular exponent
};

struct Sphere
{
    vec3 center;
    float radius;
    Material mtl;
};

struct Light
{
    vec3 position;
    vec3 intensity;
};

struct HitInfo
{
    float t;
    vec3 position;
    vec3 normal;
    Material mtl;
};

uniform Sphere spheres[NUM_SPHERES];
uniform Light lights[NUM_LIGHTS];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay(inout HitInfo hit, Ray ray);

// Shades the given point and returns the computed color.
vec3 Shade(Material mtl, vec3 position, vec3 normal, vec3 view)
{
    vec3 color = vec3(0, 0, 0);

    for (int i = 0; i < NUM_LIGHTS; ++i)
    {
        Light light = lights[i];

        // TO-DO: Check for shadows

        vec3 lightDir = normalize(light.position - position);
        float lightDistance = distance(position, light.position);

        Ray shadowRay;
        shadowRay.pos = position + 1e-3 * normal;
        shadowRay.dir = lightDir;

        HitInfo shadowHit;
        if (IntersectRay(shadowHit, shadowRay) && shadowHit.t + 1e-3 < lightDistance)
        {
            continue;
        }

        // TO-DO: If not shadowed, perform shading using the Blinn model

        vec3 N = normalize(normal);
        vec3 L = normalize(shadowRay.dir);
        vec3 V = normalize(view);

        vec3 diffuseTerm = max(dot(N, L), 0.0) * mtl.k_d;

        vec3 halfway = normalize(L + V);
        float specIntensity = pow(max(dot(N, halfway), 0.0), mtl.n);
        vec3 specularTerm = mtl.k_s * specIntensity;

        color += (diffuseTerm + specularTerm) * light.intensity;
    }

    return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay(inout HitInfo hit, Ray ray)
{

    hit.t = 1e30;
    bool foundHit = false;

    for (int i = 0; i < NUM_SPHERES; ++i)
    {
        // TO-DO: Test for ray-sphere intersection

        Sphere sphere = spheres[i];
        vec3 d = normalize(ray.dir);
        vec3 p = ray.pos;

        vec3 oc = p - sphere.center;
        float radius = sphere.radius;
        float a = dot(d, d);
        float b = 2.0 * dot(d, oc);
        float c = dot(oc, oc) - radius * radius;
        float discriminant = b * b - 4.0 * a * c;

        // TO-DO: If intersection is found, update the given HitInfo
        if (discriminant >= 0.0)
        {
            float root = sqrt(discriminant);
            float t = (-b - root) / (2.0 * a);

            if (t > 1e-3 && t < hit.t)
            {
                hit.t = t;
                hit.position = p + t * d;

                hit.normal = (hit.position - sphere.center) / radius;
                hit.mtl = sphere.mtl;

                foundHit = true;
            }
        };
    }
    return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer(Ray ray)
{
    HitInfo hit;
    if (IntersectRay(hit, ray))
    {
        vec3 view = normalize(-ray.dir);
        vec3 clr = Shade(hit.mtl, hit.position, hit.normal, view);

        // Compute reflections
        vec3 k_s = hit.mtl.k_s;

        // TO-DO: Initialize the reflection ray

        Ray r; // this is the reflection ray
        r.pos = hit.position;
        vec3 n = normalize(hit.normal);
        r.dir = normalize(reflect(-view, n));

        HitInfo h; // reflection hit info

        for (int bounce = 0; bounce < MAX_BOUNCES; ++bounce)
        {
            if (bounce >= bounceLimit)
                break;
            if (hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0)
                break;

            if (IntersectRay(h, r))
            {
                // TO-DO: Hit found, so shade the hit point

                vec3 viewDir = -r.dir;
                vec3 reflectedColor = Shade(h.mtl, h.position, h.normal, viewDir);

                // TO-DO: Update the loop variables for tracing the next reflection ray

                clr += reflectedColor * k_s;
                k_s = h.mtl.k_s;

                vec3 newNormal = normalize(h.normal);
                r.pos = h.position;
                r.dir = normalize(reflect(-viewDir, newNormal));
            }
            else
            {
                // The refleciton ray did not intersect with anything,
                // so we are using the environment color
                clr += k_s * textureCube(envMap, r.dir.xzy).rgb;
                break; // no more reflections
            }
        }
        return vec4(clr, 1); // return the accumulated color, including the reflections
    }
    else
    {
        return vec4(textureCube(envMap, ray.dir.xzy).rgb, 1.0); // return the environment color
    }
}

`;