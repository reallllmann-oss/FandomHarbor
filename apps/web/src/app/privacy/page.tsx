import type { Metadata } from "next";

import { pageMetadata } from "../../lib/seo";
import {
  BulletList,
  ContactLink,
  NumberedList,
  PolicyParagraph,
  PolicySection,
  PolicySubsection,
  PublicPolicyPage,
} from "../_components/public-policy";

export const metadata: Metadata = pageMetadata({
  description:
    "Fandom Harbor V1 关于个人信息处理、使用、保留、保护及用户请求的隐私政策。",
  pathname: "/privacy",
  title: "Privacy Policy",
});

// Canonical source: docs/19_Release/V1-PUBLIC-POLICY-V1.0.md, section 2.
export default function PrivacyPage() {
  return (
    <PublicPolicyPage
      description="本页说明 Fandom Harbor V1 处理哪些信息、处理目的、基础设施服务、保留与保护方式，以及用户如何提交个人信息相关请求。"
      title="Privacy Policy"
    >
      <PolicySection id="information" title="1. 我们处理的信息">
        <PolicyParagraph>
          为提供和保护 Fandom Harbor V1，我们可能处理以下信息：
        </PolicyParagraph>
        <BulletList>
          <li>注册名及认证相关信息；</li>
          <li>邀请码、角色、有效账号及访问权限信息；</li>
          <li>用户创建的作品、章节、Article 及相关应用数据；</li>
          <li>访问日志、错误日志和必要的安全审计记录；</li>
          <li>用户通过正式联系渠道主动提交的请求信息。</li>
        </BulletList>
        <PolicyParagraph>
          阅读偏好、书签和阅读历史目前主要保存在用户浏览器的本地存储中。浏览器本地数据与平台服务器保存的数据不同；清除浏览器数据可能移除这些本地记录。
        </PolicyParagraph>
        <PolicyParagraph>
          请不要提交与服务无关的敏感个人信息，也不要向任何人提供密码、Cookie、Token、Session、完整邀请码或其他认证
          Secret。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="sources" title="2. 信息来源与本地技术">
        <PolicyParagraph>我们处理的个人信息可能来自：</PolicyParagraph>
        <BulletList>
          <li>用户主动提交的信息；</li>
          <li>用户进行注册、登录、创作、阅读和权限操作时产生的信息；</li>
          <li>系统运行时自动生成的访问记录、错误记录和安全记录。</li>
        </BulletList>
        <PolicyParagraph>
          为维持登录状态并提供基础功能，Fandom Harbor 可能使用
          Cookie、浏览器本地存储、Session 或类似技术。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection
        id="sale-and-advertising"
        title="3. 个人信息出售与广告使用"
      >
        <PolicyParagraph>
          Fandom Harbor
          不出售用户个人信息，也不将用户个人信息用于第三方跨站广告画像。
        </PolicyParagraph>
        <PolicyParagraph>当前 V1 不使用广告追踪服务。</PolicyParagraph>
        <PolicyParagraph>
          如未来引入新的分析、广告或其他数据处理服务，Fandom Harbor
          运营方将在启用前更新公开政策，并按照适用要求向用户提供必要说明。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="purposes" title="4. 使用目的">
        <PolicyParagraph>
          我们仅在运行和保护服务所需的范围内使用这些信息，包括：
        </PolicyParagraph>
        <BulletList>
          <li>完成身份认证并管理访问权限；</li>
          <li>管理邀请码、角色、有效账号及访问权限；</li>
          <li>支持作品、章节和 Article 的创作、发布、发现和阅读；</li>
          <li>保存用户在浏览器中的阅读偏好和本地记录；</li>
          <li>排查错误、防止滥用、处理安全事件并保留必要的审计记录；</li>
          <li>响应导出、删除、下架和其他支持请求。</li>
        </BulletList>
      </PolicySection>

      <PolicySection id="third-parties" title="5. 第三方服务">
        <PolicyParagraph>
          Fandom Harbor V1 使用以下第三方服务提供基础设施：
        </PolicyParagraph>
        <BulletList>
          <li>
            <strong className="text-foreground">Supabase</strong>
            ：认证、数据库及相关后端服务；
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong>
            ：Web 应用托管及相关运行服务。
          </li>
        </BulletList>
        <PolicyParagraph>
          这些基础设施服务可能按照其各自的条款和隐私规则，在其提供服务的地区处理运行
          Fandom Harbor
          所需的数据。本文档不对未经核对的具体服务器或数据处理地区作出承诺。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="retention" title="6. 保留和保护">
        <PolicyParagraph>
          账号、Membership、作品、章节、Article
          及相关应用数据，在账号或内容正常存续期间保留。完成有效删除请求后，我们将从活动数据库中删除适用数据。
        </PolicyParagraph>
        <PolicyParagraph>
          部分信息可能因安全、审计、争议处理或法律义务，在合理且必要的范围内暂时继续保留；不再需要时再通过受控流程处理。本政策不把未经确认的
          90、180 或 365 天期限作为固定承诺。
        </PolicyParagraph>
        <PolicyParagraph>
          我们会采用与 V1
          小范围运行相匹配的访问控制和安全措施，但任何在线服务都不能保证绝对安全。请勿向任何人（包括
          Fandom Harbor 技术执行者）共享密码、Cookie、Token 或 Session。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="rights" title="7. 用户请求与个人信息权利">
        <PolicyParagraph>
          用户可以通过 <ContactLink />
          提交个人信息查阅、复制、导出、更正、补充、删除或处理规则解释等请求。
        </PolicyParagraph>
        <PolicyParagraph>
          有效数据导出请求的目标处理时间为 30
          天内。有效数据删除请求在完成身份核验后的目标处理时间为 30
          天内。目标处理时间不是任何情况下都绝对保证完成的承诺。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="requests" title="8. 数据导出与删除请求">
        <PolicySubsection title="8.1 提交请求">
          <PolicyParagraph>
            请通过 <ContactLink /> 提交请求，并说明：
          </PolicyParagraph>
          <BulletList>
            <li>请求类型：数据导出、账号或数据删除、内容下架或其他；</li>
            <li>与账号或内容相关的必要识别信息；</li>
            <li>请求范围和原因；</li>
            <li>如适用，可供核对的作品名称、链接或权利证明。</li>
          </BulletList>
          <PolicyParagraph>
            核验可以基于当前登录状态、注册名、请求发送渠道、必要的附加账号信息，以及为防止冒领所需的合理确认。无法可靠确认身份时，我们可以暂停或拒绝执行导出或删除；不会要求与核验目的明显无关的过量个人信息或认证
            Secret。
          </PolicyParagraph>
        </PolicySubsection>

        <PolicySubsection title="8.2 数据导出">
          <PolicyParagraph>
            有效数据导出请求的目标处理时间为
            <strong className="text-foreground"> 30 天内</strong>
            。如请求复杂、范围不清或需要补充验证，我们会通过联系邮箱沟通后续安排。
          </PolicyParagraph>
        </PolicySubsection>

        <PolicySubsection title="8.3 删除请求">
          <PolicyParagraph>
            有效数据删除请求在完成身份核验后的目标处理时间为
            <strong className="text-foreground"> 30 天内</strong>
            。为防止误删、权限破坏或审计缺失，删除通常按照以下受控顺序处理：
          </PolicyParagraph>
          <NumberedList>
            <li>暂停相关访问；</li>
            <li>对相关内容取消公开或归档；</li>
            <li>核对请求范围、权限、依赖关系和必要审计记录；</li>
            <li>经批准后通过受控流程完成适当的删除或保留处理。</li>
          </NumberedList>
          <PolicyParagraph>
            部分数据可能因安全、审计、争议处理或法律义务暂时保留。备份副本按照正常轮换周期自然过期，不能承诺在请求当日从所有备份中立即物理消失。
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection id="backups" title="9. 备份边界">
        <PolicyParagraph>
          当前内部逻辑备份轮换目标为最近 7 份日备份和最近 4 份周备份，整体约 30
          天。这是当前内部运维目标，不是永久不变或法律强制的承诺。
        </PolicyParagraph>
        <PolicyParagraph>
          当前逻辑备份不包含 Supabase Auth 密码散列、Session、MFA、OAuth
          identity 或 Storage 实际文件对象。当前 Storage Bucket 数量为
          0，实际文件对象数量为 0。
        </PolicyParagraph>
      </PolicySection>
    </PublicPolicyPage>
  );
}
