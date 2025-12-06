from math import ceil


def materials_count(mat_in_one_product, product_qty):
    if mat_in_one_product >= product_qty:
        return 1
    elif mat_in_one_product < product_qty:
        return ceil(product_qty / mat_in_one_product)
    return None
