<template>
  <div>
    <el-card class="box-card">
      <div class="clearfix" slot="header">
        <span>全部图文</span>
      </div>
      <div class="text item">
        <el-form ref="searchFormRef" :model="searchForm">
          <el-form-item label="文章状态：">
            <!-- v-model：双向绑定，获取被选中的项目  或 设置哪个项目选中 -->
            <!-- label：用于设置当前单选按钮的value值情况 -->
            <el-radio v-model="searchForm.status" label>全部</el-radio>
            <el-radio v-model="searchForm.status" :label="0">草稿</el-radio>
            <el-radio v-model="searchForm.status" :label="1">待审核</el-radio>
            <el-radio v-model="searchForm.status" :label="2">审核通过</el-radio>
            <el-radio v-model="searchForm.status" :label="3">审核失败</el-radio>
            <el-radio v-model="searchForm.status" :label="4">已删除</el-radio>
          </el-form-item>
          <el-form-item label="频道列表：">
            <el-select v-model="searchForm.channel_id" placeholder="请选择" clearable>
              <el-option
                v-for="item in channelList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
              <!-- v-model: 双向绑定，获取选中的项目  或 设置哪个项目选中 -->
              <!-- clearable：可以清除选中的项目 -->
              <!-- label  设置每个项目对外提示的名称 -->
              <!-- value 设置每个项目真实起作用的value值 -->
            </el-select>
          </el-form-item>
          <el-form-item label="时间选择：">
            <el-date-picker
              v-model="timetotime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
            <!--el-date-picker组件的v-model="timetotime"接收到的是一个数组信息-->
            <!-- 里边的第1、2个单元分别代表开始日期和结束日期，要想办法把其分配给searchForm的两个成员里边去 -->
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <div class="clearfix" slot="header">
        <span>共找到{{tot}}条符合条件的内容</span>
      </div>
      <div class="text item">
        <el-table :data="articleList" style="width:100%;">
          <el-table-column label="图标">
            <img :src="stData.row.cover.images[0]" alt slot-scope="stData" width="150" height="100" />
            <!-- img标签 绘制完毕，其中的src属性 比较特殊，其需要通过后端数据提供，具体是“作用域插槽” -->
            <!-- stData调用row：代表当前被遍历出来的每个文章记录信息(对象){cover、id、pubdate、status、title等字段} -->
          </el-table-column>
          <el-table-column label="标题" prop="title" width="300"></el-table-column>
          <el-table-column label="状态" prop="status" width="100">
            <!--如果当前内容区域中多个标签都使用了 作用域插槽，
            可以优化为：提供一个父级的template标签统一使用作用域插槽-->
            <template slot-scope="stData">
                <el-tag v-if="stData.row.status===0">草稿</el-tag>
                <el-tag v-else-if="stData.row.status===1" type="success">待审核</el-tag>
                <el-tag v-else-if="stData.row.status===2" type="info">审核通过</el-tag>
                <el-tag v-else-if="stData.row.status===3" type="warning">审核失败</el-tag>
                <el-tag v-else type="danger">已删除</el-tag>
                <!-- el-tag是一个通过type属性体现不同样式效果的组件标签 -->
                <!-- 多个el-tag组件标签都要使用数据部分，作用域插槽不用体现多份，
                为了减少重复代码编写量，可以使用一个公共的父级template标签统一接收使用 -->
            </template>
          </el-table-column>
          <el-table-column label="发布时间" prop="pubdate" width="160"></el-table-column>
          <el-table-column label="操作">
            <el-button type="primary" size="mini">修改</el-button>
            <el-button type="danger" size="mini">删除</el-button>
            <!-- size=“mini”设置按钮大小的，相关选项值有  medium / small / mini-->
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ArticleList',
  // 请给每个业务组件都设置name属性值，以便通过devtools调试工具进行准确查找
  data () {
    return {
      tot: 0,
      // 频道数据（假）
      channelList: [],
      // 搜索表单数据
      searchForm: {
        // 文章状态，0-草稿，1-待审核，2-审核通过，3-审核失败，4-已删除，不传为全部
        status: '', // 状态
        channel_id: '', // 频道
        begin_pubdate: '', // 文章发布开始时间
        end_pubdate: '', // 文章发布结束时间
        // 增加分页相关成员
        page: 1, // 默认获取第1页数据
        per_page: 10 // 每页返回10条记录
      },
      timetotime: [],
      articleList: []
    }
  },
  watch: {
    // 对timetotine成员进行监听
    timetotime (newval) {
      // 把newval的值拆分分别给到 begin_pubdate和end_pubdate 里边
      if (newval) {
        //  赋予时间信息
        this.searchForm.begin_pubdate = newval[0]
        this.searchForm.end_pubdate = newval[1]
      } else {
        //  清空
        this.searchForm.begin_pubdate = ''
        this.searchForm.end_pubdate = ''
        // 现在时间选择器的信息就会自动填充给begin_pubdate 和 end_pubdate了
      }
    }
  },
  created () {
    this.getChannelList()
    this.getArticleList()
  },
  methods: {
    getChannelList () {
      var pro = this.$http.get('/channels')
      pro
        .then(result => {
          //   console.log(result)
          if (result.data.message === 'OK') {
            this.channelList = result.data.data.channels
          }
        })
        .catch(err => {
          return this.$message.error('获得文章频道错误：' + err)
        })
    },
    // 获得文章列表信息
    getArticleList () {
      // 把searchForm内部为空的成员都过滤掉
      let searchData = {}
      for (var i in this.searchForm) {
        //   i:代表对象成员属性名称，status，channel_id，begin_pudate等等
        if (this.searchForm[i]) {
          searchData[i] = this.searchForm[i]
        }
      }
      let pro = this.$http.get('/articles')
      pro
        .then(result => {
          console.log(result)

          if (result.data.message === 'OK') {
            // 把文章赋予给articleList成员
            this.articleList = result.data.data.results
            this.tot = result.data.data.total_count // 总记录条数
          }
        })
        .catch(err => {
          return this.$message.error('获得文章列表错误：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.box-card {
  margin-bottom: 15px;
}
</style>
