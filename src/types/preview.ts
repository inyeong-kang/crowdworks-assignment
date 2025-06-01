export interface BoundingBox {
    l: number;
    t: number;
    r: number;
    b: number;
    coord_origin: string;
    text?: string;
}

export interface Prov {
    page_no: number;
    bbox: BoundingBox;
    charspan?: [number, number];
}

export interface BaseItem {
    self_ref: string;
    parent: {
        $ref: string;
    };
    children: {
        $ref: string;
    }[];
    content_layer: string;
    label: string;
    prov: Prov[];
}

export interface TextItem extends BaseItem {
    content: string;
    type: string;
    orig?: string;
    text?: string;
}

export interface PictureItem extends BaseItem {
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
    bbox: BoundingBox;
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

export interface TableItem extends BaseItem {
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

interface PageSize {
    width: number;
    height: number;
}

interface PageImage {
    mimetype: string;
    dpi: number;
}

interface Page {
    size: PageSize;
    image: PageImage;
}

interface Pages {
    [key: string]: Page;
}

export interface GroupItem {
    self_ref: string;
    parent: {
        $ref: string;
    };
    content_layer: string;
    label: string;
    prov: Prov[];
    children: DoclingNode[];
}

export interface DoclingDocument {
    texts: TextItem[];
    pictures: PictureItem[];
    tables: TableItem[];
    groups: GroupItem[];
    body: DoclingNode;
    pages: Pages;
}
