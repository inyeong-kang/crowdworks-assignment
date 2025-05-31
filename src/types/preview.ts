export interface TextItem {
    self_ref: string;
    content: string;
    type: string;
    orig?: string;
    text?: string;
}

export interface PictureItem {
    self_ref: string;
    parent: {
        $ref: string;
    };
    children: {
        $ref: string;
    }[];
    content_layer: string;
    label: string;
    prov: {
        page_no: number;
        bbox: {
            l: number;
            t: number;
            r: number;
            b: number;
            coord_origin: string;
        };
        charspan: number[];
    }[];
    image: {
        mimetype: string;
        dpi: number;
        size: {
            width: number;
            height: number;
        };
        uri: string;
    };
}

export interface TableCell {
    bbox: {
        l: number;
        t: number;
        r: number;
        b: number;
        coord_origin: string;
    };
    row_span: number;
    col_span: number;
    start_row_offset_idx: number;
    end_row_offset_idx: number;
    start_col_offset_idx: number;
    end_col_offset_idx: number;
    text: string;
    column_header: boolean;
    row_header: boolean;
    row_section: boolean;
}

export interface TableItem {
    self_ref: string;
    parent: {
        $ref: string;
    };
    children: {
        $ref: string;
    }[];
    content_layer: string;
    label: string;
    prov: {
        page_no: number;
        bbox: {
            l: number;
            t: number;
            r: number;
            b: number;
            coord_origin: string;
        };
        charspan: number[];
    }[];
    data: {
        table_cells: TableCell[];
        num_rows: number;
        num_cols: number;
        grid: TableCell[][];
    };
}

export interface DoclingNode {
    type: string;
    self_ref: string;
    children?: DoclingNode[];
    marker?: string;
    $ref?: string;
    content_layer?: string;
    name?: string;
    label?: string;
    parent?: {
        $ref: string;
    };
}

export interface DoclingDocument {
    texts: TextItem[];
    tables: TableItem[];
    pictures: PictureItem[];
    key_value_items: unknown[];
    body: DoclingNode;
    furniture: DoclingNode;
    groups: DoclingNode[];
}

export interface PreviewProps {
    url: string;
}
