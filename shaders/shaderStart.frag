#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;
in vec4 fragPosLightSpace;

out vec4 fColor;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;

//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;
float shadow;

float specularStrengthPoint = 0.7f;
float ambientPoint = 1.0f;
float shininessPoint = 70.0f;

uniform int pointinit;
uniform vec3 lightPointPos;

float constant = 1.0f;
float linear = 0.09f;
float quadratic = 0.1;
uniform mat4 view;

uniform float fogDensity;

vec3 computeLightComponents()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	vec3 normalEye = normalize(fNormal);	
	vec3 lightDirN = normalize(lightDir);
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
	ambient = ambientStrength * lightColor;
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;

	return (ambient + diffuse + specular);
}

float computeFog(){
	float fragmentDistance = length(fPosEye);
	float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
	return clamp(fogFactor, 0.0f, 1.0f);
}

vec3 computePointLight(vec4 lightPosEye) {
    vec3 cameraPosEye = vec3(0.0f);
    vec3 normalEye = normalize(fNormal);
    vec3 lightDirN = normalize(lightPosEye.xyz - fPosEye.xyz);
    vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
    vec3 ambient = ambientPoint * lightColor;
    vec3 diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
    vec3 halfVector = normalize(lightDirN + viewDirN);
    float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), shininessPoint);
    vec3 specular = specularStrengthPoint * specCoeff * lightColor;
    float distance = length(lightPosEye.xyz - fPosEye.xyz);
    float att = 1.0f / (constant + linear * distance + quadratic * distance * distance);
    return (ambient + diffuse + specular) * att;
}

float computeShadow()
{
	vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
	normalizedCoords = normalizedCoords * 0.5 + 0.5;
	
	if (normalizedCoords.z > 1.0f)
		return 0.0f;

	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
	float currentDepth = normalizedCoords.z;
	float bias = 0.0005f;
	float shadow = currentDepth - bias > closestDepth ? 1.0f : 0.0f;
	
	return shadow;
}


void main() 
{
	vec3 light = computeLightComponents();
	
	vec3 baseColor = vec3(0.9f, 0.35f, 0.0f);//orange
	
	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;

	if(pointinit == 1){
		vec4 lightPointPosEye = view * vec4(lightPointPos, 1.0);
		light = light + computePointLight(lightPointPosEye);
	}

	//modulate with shadow
	shadow = computeShadow();
	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);

	float fogFactor = computeFog();
	vec4 fogColor = vec4(1.0f,1.0f,1.0f,1.0f);
	

    fColor = mix(fogColor, min(vec4(color, 1.0f) * vec4(light, 1.0f), 1.0f), fogFactor);
}
