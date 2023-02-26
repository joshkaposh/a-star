import { Component, createEffect, createSignal, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import Grid, { Grid_Node } from '../Grid'
import A_Star from '../A_star';
import Input from '../Input';

const initializeCanvas = (render: () => void) => {
    let animationId: number;
    const runningSignal = createSignal(false)

    function stop() {
        runningSignal[1](false)
        cancelAnimationFrame(animationId)
    }

    function start() {
        runningSignal[1](true)
        requestAnimationFrame(animate);
    }

    function animate() {
        render()
        animationId = requestAnimationFrame(animate);
    }

    return { start, stop, isRunning: runningSignal[0] }
}

const UI: Component = () => {
    onMount(() => {
        setContext(canvasRef.getContext('2d')!)
    })

    let canvasRef!: HTMLCanvasElement;
    const [context, setContext] = createSignal<CanvasRenderingContext2D>()

    const [grid_details, set_grid_details] = createStore({
        columns: 10,
        rows: 10,
        width: window.innerWidth,
        height: window.innerHeight,
        tilesizeX: Math.floor(window.innerWidth / 10),
        tilesizeY: Math.floor(window.innerHeight / 10),

    })

    const input = new Input();
    const [mouse, setMouse] = createStore({
        x: 0,
        y: 0
    })
    const grid = new Grid(grid_details.columns, grid_details.rows, grid_details.tilesizeX, grid_details.tilesizeY)

    const [canMakeObstacle, setCanMakeObstacle] = createSignal(false)

    const makeObstacleKeyBind = () => setCanMakeObstacle(!canMakeObstacle());
    const placeObstacle = () => {
        const node = grid.getNodeXY(mouse.x, mouse.y)
        node.walkable = !node.walkable
    }
    const [result, setResult] = createSignal<ReturnType<A_Star['find_path']>>()
    const a_star = new A_Star()
    const { start, stop, isRunning } = initializeCanvas(() => {
        const ctx = context()!
        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height)
        for (let i = 0; i < grid.nodes.length; i++) {
            const node = grid.nodes[i]
            ctx.beginPath();
            ctx.rect(node.col * grid_details.tilesizeX, node.row * grid_details.tilesizeY, grid_details.tilesizeX, grid_details.tilesizeY)
            if (!node.walkable) {
                ctx.fillStyle = 'black'
                ctx.fill()
            }
            ctx.stroke();
            ctx.closePath();
        }
        if (result()) {
            ctx.fillStyle = 'lightgreen';

            const path = result() as Grid_Node[];
            for (let i = 0; i < path.length; i++) {
                const node = path[i];
                ctx.fillRect(node.col * grid_details.tilesizeX, node.row * grid_details.tilesizeY, grid_details.tilesizeX, grid_details.tilesizeY)

            }
        }
        const first = grid.first;
        const last = grid.last!;
        ctx.fillStyle = 'green';
        ctx.fillRect(first.col * grid_details.tilesizeX, first.row * grid_details.tilesizeY, grid_details.tilesizeX, grid_details.tilesizeY)
        ctx.fillStyle = 'red';
        ctx.fillRect(last.col * grid_details.tilesizeX, last.row * grid_details.tilesizeY, grid_details.tilesizeX, grid_details.tilesizeY)

        if (canMakeObstacle()) {
            const node = grid.getNodeXY(mouse.x, mouse.y)
            ctx.fillStyle = 'grey'
            ctx.fillRect(node.col * grid_details.tilesizeX, node.row * grid_details.tilesizeY, grid_details.tilesizeX, grid_details.tilesizeY)

        }
    })

    window.addEventListener('resize', (e) => {
        e.preventDefault();
        set_grid_details('width', window.innerWidth)
        set_grid_details('height', window.innerHeight)
        set_grid_details('tilesizeX', Math.floor(canvasRef.width / grid_details.columns))
        set_grid_details('tilesizeY', Math.floor(canvasRef.height / grid_details.rows))
        console.log('GridDetails', grid_details);
    })

    window.addEventListener('mousemove', (e) => {
        e.preventDefault();
        const rect = canvasRef.getBoundingClientRect();
        setMouse('x', e.clientX - rect.left)
        setMouse('y', e.clientY - rect.top)

    })

    window.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (isRunning() && canMakeObstacle()) {
            placeObstacle();
        }
    })

    window.addEventListener('keydown', (e) => {


        if (e.shiftKey) {
            if (input.getKey('KeyW')) {
                makeObstacleKeyBind();
                return;
            }
        } else {
            if (canMakeObstacle() && e.code === 'KeyW') {
                placeObstacle()
            }
        }
    })

    createEffect(() => {
        setContext(canvasRef.getContext('2d')!)
        const ctx = context()!
        ctx.imageSmoothingEnabled = false;
        canvasRef.width = grid_details.width;
        canvasRef.height = grid_details.height;
        canvasRef.style.width = '100%';
        canvasRef.style.height = '100%';

    })

    return <div class='canvas-container'>
        <canvas ref={canvasRef} />
        <div class='canvas-tools'>
            <button type='button' textContent={isRunning() ? 'Stop' : 'Start'} onclick={(e) => {
                e.preventDefault();
                isRunning() ? stop() : start();
            }} />


            <button type='button' onClick={(e) => {
                e.preventDefault();
                setResult(a_star.find_path(grid.first, grid.last!));

            }}>Find Path</button>
            <div>
                <p>Keybinds</p>
                <p>[Shift + W]: edit obstacles</p>
                <Show when={canMakeObstacle()}>
                    <p>[W]: place/remove obstacles</p>
                </Show>
            </div>



        </div>
    </div>
}

export default UI