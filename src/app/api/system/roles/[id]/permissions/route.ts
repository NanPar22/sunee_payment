import { getAllMenus, updateRolePermissions } from '@/lib/role'
import { NextRequest, NextResponse } from 'next/server'


// GET - ดึง menus ทั้งหมดเพื่อแสดงใน UI
export async function GET() {
  try {
    const menus = await getAllMenus()
    return NextResponse.json(menus)
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

// PUT - อัพเดท permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = parseInt(params.id)
    
    if (isNaN(roleId)) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { permissions } = body

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'permissions must be an array' },
        { status: 400 }
      )
    }

    await updateRolePermissions(roleId, permissions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}