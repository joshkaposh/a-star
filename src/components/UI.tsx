import { Accessor, Component, createEffect, createSignal, Match, onMount, Setter, Show, Switch } from 'solid-js'
import { createStore } from 'solid-js/store'
import Grid from '../Grid'
import A_Star from '../A_star';
import Input from '../Input';

type Grid_Node = ReturnType<Grid['getNode']>;
type KeyBindTypes = "KeyW" | 'KeyS' | "KeyE";

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

function drawPath(ctx: CanvasRenderingContext2D, result: ReturnType<A_Star['find_path']>, sX: number, sY: number) {
    if (result) {
        ctx.fillStyle = 'lightgreen';

        for (let i = 0; i < result.length; i++) {
            const node = result[i];
            ctx.fillRect(node.col * sX, node.row * sY, sX, sY)

        }
    }
}
function drawStartAndEnd(ctx: CanvasRenderingContext2D, { start_node, end_node }: { start_node: Grid_Node; end_node: Grid_Node; }, sX: number, sY: number) {

    ctx.fillStyle = 'green';
    ctx.fillRect(start_node.col * sX, start_node.row * sY, sX, sY)

    ctx.fillStyle = 'red';
    ctx.fillRect(end_node.col * sX, end_node.row * sY, sX, sY)
}

function drawKeyBind(ctx: CanvasRenderingContext2D, active_bind: KeyBindTypes, node: Grid_Node, sX: number, sY: number) {
    switch (active_bind) {
        case 'KeyW':
            ctx.fillStyle = 'grey'
            ctx.fillRect(node.col * sX, node.row * sY, sX, sY)

            break;
        case "KeyS":
            ctx.fillStyle = 'green'
            ctx.fillRect(node.col * sX, node.row * sY, sX, sY)

            break;
        case "KeyE":
            ctx.fillStyle = 'red'
            ctx.fillRect(node.col * sX, node.row * sY, sX, sY)
            break;
    }

}

function drawNodes(ctx: CanvasRenderingContext2D, nodes: Grid['nodes'], sX: number, sY: number) {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        ctx.beginPath();
        ctx.rect(node.col * sX, node.row * sY, sX, sY)
        if (!node.walkable) {
            ctx.fillStyle = 'black'
            ctx.fill()
        }
        ctx.stroke();
        ctx.closePath();
    }
}

const Commands: Component<{
    // isRunning: Accessor<boolean>
    text: string;
    handleRunning: () => void;
    findPath: () => void;

}> = (props) => {
    return <ul id='tools'>
        <li>
            <button type='button' textContent={props.text} onclick={(e) => {
                e.preventDefault();
                props.handleRunning();
            }} />
        </li>
        <li>
            <button type='button' onClick={(e) => {
                e.preventDefault();
                props.findPath();
            }}>Find Path </button>
        </li>

    </ul>
}

const KeybindCommands: Component<{
    active_bind: Accessor<KeyBindTypes | undefined>
    set_active_bind: Setter<KeyBindTypes | undefined>
}> = ({ active_bind, set_active_bind }) => {
    const [collaped, setCollaped] = createSignal(false)
    const toggle = () => setCollaped(!collaped())

    return <Show when={!collaped()} fallback={
        <button type='button' onClick={toggle}>Show Keybinds</button>
    }>
        <div id='keybinds'>
            <button type='button' onClick={toggle}>Hide Keybinds</button>
            <ul id='keybind-commands'>
                <li>
                    <button type='button' onClick={() => {
                        set_active_bind('KeyW')
                    }}>
                        [Shift + W]: edit obstacles
                    </button>
                </li>
                <li>
                    <button type='button' onClick={() => {
                        set_active_bind('KeyS')
                    }}>[Shift + S]: edit start</button>
                </li>
                <li>
                    <button type='button' onClick={() => {
                        set_active_bind('KeyE')
                    }}>[Shift + E]: edit end</button>
                </li>

                <Switch>
                    <Match when={active_bind() === 'KeyW'}>
                        <p>[W]: place/remove obstacles</p>
                    </Match>
                    <Match when={active_bind() === 'KeyS'}>
                        <p>[S]: change start location</p>
                    </Match>
                    <Match when={active_bind() === 'KeyE'}>
                        <p>[E]: change end location</p>
                    </Match>
                </Switch>
            </ul>
        </div>
    </Show>

    return
}


const UI: Component = () => {
    let canvasRef!: HTMLCanvasElement;

    onMount(() => {
        setContext(canvasRef.getContext('2d')!)
    })

    const [grid_details, set_grid_details] = createStore({
        columns: 10,
        rows: 10,
        width: window.innerWidth,
        height: window.innerHeight,
        tilesizeX: Math.floor(window.innerWidth / 10),
        tilesizeY: Math.floor(window.innerHeight / 10),

    })

    const grid = new Grid(grid_details.columns, grid_details.rows, grid_details.tilesizeX, grid_details.tilesizeY)
    const input = Input.instance();
    const a_star = new A_Star()

    const [context, setContext] = createSignal<CanvasRenderingContext2D>()
    const [result, setResult] = createSignal<ReturnType<A_Star['find_path']>>()
    const [goal, setGoal] = createStore({
        start_node: grid.first,
        end_node: grid.last!
    })

    const [mouse, setMouse] = createStore({
        x: 0,
        y: 0
    })

    const [active_bind, set_active_bind] = createSignal<KeyBindTypes>()
    const keybinds = {
        set(key: KeyBindTypes) {
            if (active_bind() === key) {
                set_active_bind();
                return;
            }
            set_active_bind(key);
        },
        place() {
            const activeBind = active_bind();
            const node = grid.getNodeXY(mouse.x, mouse.y)

            switch (activeBind) {
                case 'KeyW':
                    node.walkable = !node.walkable
                    return;
                case 'KeyS':
                    setGoal('start_node', node)
                    return;
                case 'KeyE':
                    setGoal('end_node', node)
                    return
                default:
                    return;
            }
        },


    }
    const { start, stop, isRunning } = initializeCanvas(() => {
        const ctx = context()!
        const activeBind = active_bind()

        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height)

        drawPath(ctx, result()!, grid_details.tilesizeX, grid_details.tilesizeY)
        drawStartAndEnd(ctx, goal, grid_details.tilesizeX, grid_details.tilesizeY)
        if (activeBind) drawKeyBind(ctx, activeBind, grid.getNodeXY(mouse.x, mouse.y), grid_details.tilesizeX, grid_details.tilesizeY)
        drawNodes(ctx, grid.nodes, grid_details.tilesizeX, grid_details.tilesizeY)
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

    window.addEventListener('keydown', (e) => {
        if (!e.shiftKey) {
            if (e.code === 'KeyW' || e.code === 'KeyE' || e.code === 'KeyS') {
                keybinds.place()
            }
            return;
        } else {
            if (input.getKey('KeyW')) {
                keybinds.set('KeyW');
                return;
            }
            if (input.getKey('KeyS')) {
                keybinds.set('KeyS');
                return;
            }
            if (input.getKey('KeyE')) {
                keybinds.set('KeyE');
                return;
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
        <div id='canvas-tools'>
            <Commands
                text={isRunning() ? 'Stop' : 'Start'}
                handleRunning={() => isRunning() ? stop() : start()}
                findPath={() => setResult(a_star.find_path(goal.start_node, goal.end_node))}
            />
            <KeybindCommands active_bind={active_bind} set_active_bind={set_active_bind} />
        </div>
    </div>
}

export default UI