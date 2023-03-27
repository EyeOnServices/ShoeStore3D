import React, { MouseEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaLock } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useDispatch } from 'react-redux';
import { setSelectedColor } from '../store/appSlice';
import { Color, Colors } from '../utils';



type ColorDivProps = {
    color: Color;
    onSelect: (id: number) => void;
    onToggleLock: (id: number) => void;
    index: number
}



const ColorWheel = () => {
    const [selectedColors, setSelectedColors] = useState<Color[]>([]);
    const dispatch = useDispatch();
    const [angle, setAngle] = useState(0); // add angle state
    const [angles, setAngles] = useState<number[]>([]);

    const angleBetweenContainers = 360 / Colors.length;
    const radius = 400; // radius of the circle
    const initialAngle = -90; // initial angle for the first container

    useEffect(() => {
        const newAngles = Colors.map((_, index) => angle + angleBetweenContainers * index);
        setAngles(newAngles);
    }, [angle]);

    const toggleLock = (id: number) => {
        const updatedColors = Colors.map(color =>
            color.id === id ? { ...color, locked: !color.locked } : color
        );
        setSelectedColors(updatedColors);
    }

    const updateAngle = (delta: number) => {
        setAngle((prevAngle) => prevAngle + delta);
    };

    const selectColor = (id: number) => {
        const selectedColor = Colors.find((color) => color.id === id);
        if (selectedColor && !selectedColors.includes(selectedColor)) {
            setSelectedColors([...selectedColors, selectedColor]);
            const index = Colors.findIndex((color) => color.id === id);
            const colorAngle = angle + angleBetweenContainers * index;
            dispatch(setSelectedColor(selectedColor));
            updateAngle(initialAngle - colorAngle);
        }
    };


    // for mouse scroll or drag

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        setStartX(e.clientX);
    };

    const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        if (isDragging) {
            setCurrentX(e.clientX);
        } else if (!isDragging && Math.abs(startX - e.clientX) > 5) {
            setIsDragging(true);
            setCurrentX(e.clientX);
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };


    useEffect(() => {
        if (isDragging) {
            const delta = currentX - startX;
            const wheelContainer = document.getElementById('wheel-container');
            if (wheelContainer && isDragging) {
                wheelContainer.style.transform = `rotate(${angle + delta}deg)`; // update transform with angle state
            }
        }
    }, [isDragging, currentX, startX, angle]); // add an gle state to the dependencies array

    const ColorDiv = ({ color, onSelect, onToggleLock, index }: ColorDivProps) => (

        <ColorContainer
            onClick={!color.locked ? (e) => { e.stopPropagation(); onSelect(color.id); } : undefined}
            hex={color.hex}
            locked={color.locked}
            angle={angle + angleBetweenContainers * index}
            data-color-id={color.id}
            style={{
                transform: `translate(-50%, -50%) rotate(${angle +
                    angleBetweenContainers *
                    index}deg) translate(${radius}px) rotate(${-angle -
                    angleBetweenContainers * index}deg)`,
            }}
        >
            {/* <ColorText angle={color.angle}>{color.name}</ColorText> */}
            {color.locked && <LockIcon />}
            {color.locked && <LockIcon onClick={(e) => { e.stopPropagation(); onToggleLock(color.id) }} />}
        </ColorContainer>
    );


    return (
        <>
            <WheelContainer id="wheel-container" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} >
                {Colors.map((color, index) => (
                    <ColorDiv key={color.id} color={color} onSelect={selectColor} onToggleLock={toggleLock} index={index} />
                ))}
            </WheelContainer>

        </>
    );
}

export default ColorWheel;

const LockIcon = styled(FaLock)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20px;
  margin: 5px;
`;

const WheelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  user-select: none; /* prevent text selection while dragging */
  
`;

const ColorContainer = styled.div<{ hex: string; locked: boolean; angle: number }>`
  background-color: ${props => props.hex};
  width: 60px;
  height: 90px;
  border : 2px solid #fff; 
  cursor: ${props => props.locked ? 'default' : 'pointer'};
  display: flex;
  justify-content: center;
  border-radius: 50px 50px 0 0 / 10px 10px 0 0; /* top-left, top-right, bottom-left, bottom-right */
  align-items: center;
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 100%;
`;
