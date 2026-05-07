 = Get-Content 'inicio.ts'
 =  -replace '  constructor\(\s*private categoriaService: CategoriaService,\s*private productoService: ProductoService,\s*private cartService: CartService,\s*private cd: ChangeDetectorRef\s*\) \{\}', '  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private cartService: CartService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}'
 =  -replace '  agregarAlCarrito\(producto: Producto\) \{ \s* this\.cartService\.agregar\(producto\);\s* alert\(''Añadido a tu selección\. ☕''\);\s* \}', '  agregarAlCarrito(producto: Producto) { 
    if (!this.authService.isLoggedIn()) {
      alert(''Debes iniciar sesión para agregar productos al carrito.'');
      return;
    }
    this.cartService.agregar(producto);
    alert(''Añadido a tu selección. ☕'');
  }'
Set-Content 'inicio.ts' 
