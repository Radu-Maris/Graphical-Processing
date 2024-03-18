#include "Camera.hpp"

namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
        //TODO
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraUpDirection = glm::normalize(cameraUp);
        this->cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection));
    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {
        //TODO
        glm::mat4 view = glm::lookAt(cameraPosition, cameraPosition + cameraFrontDirection, cameraUpDirection);
        return view;
    }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        //TODO
        switch (direction) {

        case MOVE_FORWARD:
            this->cameraPosition += speed * this->cameraFrontDirection;
            break;
        case MOVE_BACKWARD:
            this->cameraPosition -= speed * this->cameraFrontDirection;
            break;
        case MOVE_RIGHT:
            this->cameraPosition += speed * this->cameraRightDirection;
            break;
        case MOVE_LEFT:
            this->cameraPosition -= speed * this->cameraRightDirection;
            break;
        case MOVE_UP:
            this->cameraPosition += speed * this->cameraUpDirection;
            break;
        case MOVE_DOWN:
            this->cameraPosition -= speed * this->cameraUpDirection;
            break;
        }
    }

    //update the camera internal parameters following a camera rotate event
    //yaw - camera rotation around the y axis
    //pitch - camera rotation around the x axis
    void Camera::rotate(float pitch, float yaw) {
        //TODO

        if (pitch > 89.0f)
            pitch = 89.0f;
        if (pitch < -89.0f)
            pitch = -89.0f;

        glm::vec3 front;
        front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        front.y = sin(glm::radians(pitch));
        front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        cameraFrontDirection = glm::normalize(front);

    }
}