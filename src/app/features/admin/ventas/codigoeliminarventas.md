    def delete(self, venta_id=None):
        if venta_id is not None:
            venta = Venta.query.get_or_404(venta_id)
            
            # Revertir movimientos e inventario
            movimientos = Movimiento.query.filter(Movimiento.motivo.like(f"Venta ID: {venta_id}%")).all()
            for movimiento in movimientos:
                inventario = Inventario.query.filter_by(
                    presentacion_id=movimiento.presentacion_id,
                    almacen_id=venta.almacen_id
                ).first()
                if inventario:
                    inventario.cantidad += movimiento.cantidad
                db.session.delete(movimiento)
            
            db.session.delete(venta)
            db.session.commit()
            
            return {"message": "Venta eliminada con éxito"}, 200

        # Lógica tipo batch para eliminar varias ventas
        data = request.get_json() or {}
        venta_ids = data.get("ids", [])
        if not venta_ids or not isinstance(venta_ids, list):
            return {"error": "Debes proporcionar una lista de ids en la propiedad 'ids'"}, 400
        
        try:
            venta_ids = [int(vid) for vid in venta_ids]
        except (ValueError, TypeError):
            return {"error": "Todos los IDs en la lista 'ids' deben ser números enteros válidos"}, 400

        # Buscar ventas en lote
        ventas = Venta.query.filter(Venta.id.in_(venta_ids)).all()
        if not ventas:
            return {"message": "No se encontraron ventas para eliminar"}, 404
        
        # Verificar permisos (si no es admin, solo eliminar de su propio almacén)
        claims = get_jwt()
        user_rol = claims.get('rol')
        user_almacen_id = claims.get('almacen_id')
        if user_rol != 'admin':
            for v in ventas:
                if int(v.almacen_id) != int(user_almacen_id or 0):
                    return {"error": f"No tienes permisos para eliminar la venta #{v.id} de otro almacén"}, 403
        
        # Revertir stock y eliminar movimientos en lote
        count = 0
        for venta in ventas:
            movimientos = Movimiento.query.filter(Movimiento.motivo.like(f"Venta ID: {venta.id}%")).all()
            for movimiento in movimientos:
                inventario = Inventario.query.filter_by(
                    presentacion_id=movimiento.presentacion_id,
                    almacen_id=venta.almacen_id
                ).first()
                if inventario:
                    inventario.cantidad += movimiento.cantidad
                db.session.delete(movimiento)
            db.session.delete(venta)
            count += 1
        
        db.session.commit()
        return {"message": f"{count} ventas eliminadas con éxito"}, 200