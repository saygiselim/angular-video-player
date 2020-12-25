import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ElementRef
} from '@angular/core';

import * as _ from 'lodash-es';
import { Chart, ChartData } from 'chart.js';
@Component({
    selector: 'ss-data-chart',
    templateUrl: 'ss-data-chart.html',
    styleUrls: ['ss-data-chart.scss']
})
export class SSDataChartComponent implements OnChanges {
    @Input() config: SSDataChartConfig = new SSDataChartConfig();
    @Input() data: any[] = [];

    @ViewChild('chartCanvas', { static: true }) chartCanvas?: ElementRef;

    private chart?: Chart | null;

    ngOnChanges(simpleChanges: SimpleChanges): void {
        // If we detect config or data change outside the component, we should re-render the chart.
        if (simpleChanges.config || simpleChanges.data) {
            this.renderChart(this.getChartData());
        }
    }

    /**
     * It renders chart with the given data
     *
     * @param chartData processed chart data
     */
    renderChart(chartData: any): void {
        const config: Chart.ChartConfiguration = {
            type: this.config.datasets[0].type,
            data: chartData,
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        };

        config.options = _.merge(config.options, this.config.options);

        if (this.chartCanvas) {
            if (this.chart) {
                // If we have a recent chart reference, it will be better to destroy it.
                this.chart.destroy();
                this.chart = null;
            }

            this.chart = new Chart(this.chartCanvas.nativeElement, config);
        }
    }

    /**
     * creates chart data that can be used by chart.js with the given raw data.
     */
    getChartData(): ChartData {
        const labels = this.config.labels || [];
        const data: ChartData = {
            labels: [...labels],
            datasets: []
        };

        data.datasets = [];

        for (const index in this.data) {
            if (this.data.hasOwnProperty(index)) {
                if (this.config.labelProperty && data.labels) {
                    data.labels.push(this.data[index][this.config.labelProperty]);
                }

                for (let i = 0; i < this.config.datasets.length; i++) {
                    if (data.datasets.length <= i) {
                        const colors = this.generateRandomColors(this.data.length);

                        data.datasets.push({
                            type: this.config.datasets[i].type,
                            label: this.config.datasets[i].label || '',
                            data: [],
                            backgroundColor: colors.map((c) => c.translucent),
                            borderColor: colors.map((c) => c.opaque),
                            borderWidth: 1
                        });

                        data.datasets[i] = _.merge(data.datasets[i], this.config.datasets[i].options);
                    }

                    if (this.config.datasets[i]) {
                        const labelProperty = this.config.datasets[i].labelProperty;
                        if (labelProperty) {
                            data.datasets[i].label = this.data[index][labelProperty];
                        }
                    }

                    (data.datasets[i].data as number[]).push(this.data[index][this.config.datasets[i].valueProperty]);
                }
            }
        }

        return data;
    }

    /**
     * Generates random color between rgba(0,0,0,?) and rgba(255,255,255,?). (?:alfa channel can be set manually)
     */
    generateRandomColor(): Color {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);

        const colorPrefix = 'rgba(' + r + ',' + g + ',' + b + ',';

        return {
            translucent: colorPrefix + '0.8)',
            opaque: colorPrefix + '1)'
        };
    }

    /**
     * Generates colors by desired quantity
     *
     * @param quantity number of the colors
     */
    generateRandomColors(quantity: number): Array<Color> {
        const colors: Array<Color> = [];

        for (let i = 0; i < quantity; i++) {
            const color = this.generateRandomColor();

            const foundColors = _.find(colors, color);
            if (foundColors) {
                i--;
                continue;
            }

            colors.push(color);
        }

        return colors;
    }
}

interface Color {
    translucent: string; // semi-transparent color
    opaque: string; // solid color
}

export class SSDataChartConfig {
    labels?: string[]; // chart labels for the x axis
    labelProperty?: string; // dynamic label property
    datasets: SSDataChartDataSet[] = []; // one dataset should be given to create chart
    options?: any; // chart.js global options
}

export interface SSDataChartDataSet {
    type: SSChartType; // type of the chart. for example: line, bar, pie, ... etc.
    label?: string; // label will be shown in the info popup
    labelProperty?: string; // dynamic label property
    valueProperty: string; // dynamic value property, actual data
    options?: any; // chart.js dataset options
}

// chart.js chart types
export enum SSChartType {
    Line = 'line',
    Bar = 'bar',
    Radar = 'radar',
    Pie = 'pie',
    Doughnut = 'doughnut',
    PolarArea = 'polarArea',
    Scatter = 'scatter'
}
