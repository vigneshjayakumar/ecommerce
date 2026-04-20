// echarts.config.ts
import * as echarts from 'echarts/core';

import { LineChart, PieChart } from 'echarts/charts';
import {
    TooltipComponent,
    GridComponent,
    LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    LineChart,
    PieChart,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    CanvasRenderer
]);

export { echarts };