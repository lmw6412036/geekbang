import {Carousel} from "./carousel";
import {createElement} from "./framework";

const d = ['https://t7.baidu.com/it/u=359304471,1368552526&fm=193&f=GIF',
    'https://t7.baidu.com/it/u=2898108424,4111626737&fm=193&f=GIF',
    'https://t7.baidu.com/it/u=2807573989,921590260&fm=193&f=GIF',
    'https://t7.baidu.com/it/u=3673716604,2082259085&fm=193&f=GIF'
];

const a = <Carousel src={d}/>;


console.log(a);
a.mountTo(document.body);
